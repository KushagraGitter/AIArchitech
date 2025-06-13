
'use server';
/**
 * @fileOverview A Genkit flow to generate skeleton Terraform HCL from a system design.
 *
 * - generateTerraform - A function that handles the Terraform HCL generation.
 * - GenerateTerraformInput - The input type for the generateTerraform function.
 * - GenerateTerraformOutput - The return type for the generateTerraform function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateTerraformInputSchema = z.object({
  diagramJson: z
    .string()
    .describe("The system design diagram, as a JSON string. This JSON represents an object with 'nodes' and 'edges'. 'nodes' have 'data.label' and 'data.properties'. 'edges' may have 'label'."),
  targetProvider: z.enum(['AWS', 'GCP', 'Azure']).describe('The target cloud provider for the Terraform HCL.'),
  additionalRequirements: z.string().optional().describe('Any additional user-specified requirements or hints for the Terraform generation (e.g., "use t3.micro for EC2 instances", "prefer managed services").'),
});
export type GenerateTerraformInput = z.infer<typeof GenerateTerraformInputSchema>;

export const GenerateTerraformOutputSchema = z.object({
  terraformHcl: z.string().describe('The generated Terraform HCL code as a string. This should be a best-effort attempt and may require user review and modification.'),
  warnings: z.array(z.string()).optional().describe('An array of warnings about components or properties that could not be confidently mapped or require special attention.'),
  suggestions: z.array(z.string()).optional().describe('An array of suggestions for the user on how to refine or complete the generated Terraform code.'),
});
export type GenerateTerraformOutput = z.infer<typeof GenerateTerraformOutputSchema>;

export async function generateTerraform(input: GenerateTerraformInput): Promise<GenerateTerraformOutput> {
  return generateTerraformFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTerraformPrompt',
  model: 'googleai/gemini-2.0-flash', 
  input: {schema: GenerateTerraformInputSchema},
  output: {schema: GenerateTerraformOutputSchema},
  prompt: `You are an expert cloud architect and Terraform engineer. Your task is to generate a skeleton Terraform HCL configuration based on a provided system design diagram (JSON), a target cloud provider, and optional additional requirements.

The output should be a starting point for the user and WILL require manual review and completion.

Target Cloud Provider: {{{targetProvider}}}

System Design Diagram (JSON):
{{{diagramJson}}}

{{#if additionalRequirements}}
Additional Requirements/Hints:
{{{additionalRequirements}}}
{{/if}}

Generation Guidelines:
1.  **Provider Block**: Include a basic provider block for the '{{{targetProvider}}}'. For AWS, default to "us-east-1". For GCP, default to "us-central1". For Azure, default to "East US". Add a TODO comment for the user to update the region.
2.  **Resource Mapping**:
    *   Iterate through the 'nodes' in the diagramJson.
    *   For each node, map its 'data.label' to a common Terraform resource type for the '{{{targetProvider}}}'.
        *   Examples for AWS: "Web Server" -> aws_instance, "Database" -> aws_db_instance, "Load Balancer" -> aws_lb, "Cache" -> aws_elasticache_cluster, "Message Queue" -> aws_sqs_queue, "Storage (S3/Blob)" -> aws_s3_bucket, "API Gateway" -> aws_api_gateway_rest_api.
        *   Examples for GCP: "Web Server" -> google_compute_instance, "Database" -> google_sql_database_instance, "Load Balancer" -> google_compute_forwarding_rule/google_compute_target_pool, "Cache" -> google_memorystore_instance (Redis), "Message Queue" -> google_pubsub_topic, "Storage (S3/Blob)" -> google_storage_bucket, "API Gateway" -> google_api_gateway_api.
        *   Examples for Azure: "Web Server" -> azurerm_linux_virtual_machine/azurerm_windows_virtual_machine, "Database" -> azurerm_sql_database/azurerm_postgresql_database, "Load Balancer" -> azurerm_lb, "Cache" -> azurerm_redis_cache, "Message Queue" -> azurerm_servicebus_queue, "Storage (S3/Blob)" -> azurerm_storage_account/azurerm_storage_blob, "API Gateway" -> azurerm_api_management.
    *   Use the node's 'id' or a sanitized version of its 'data.label' (e.g., 'web_server_1', 'user_database') as the Terraform resource name. Ensure names are valid Terraform identifiers.
3.  **Property Mapping**:
    *   Attempt to map common properties from 'node.data.properties' to relevant Terraform resource arguments.
        *   E.g., for 'aws_instance', map 'instanceType' to 'instance_type', 'image_id' (if available, otherwise add a TODO for AMI).
        *   E.g., for 'aws_db_instance', map 'type' (e.g., PostgreSQL) to 'engine', 'size' to 'instance_class'.
    *   If a direct mapping is unclear or a property is complex (like 'scaling' policies), add a detailed '# TODO:' comment in the HCL explaining what needs to be configured based on the visual property.
    *   If essential arguments are missing (e.g., 'ami' for aws_instance, 'network_interface' for google_compute_instance), add placeholder values or clear '# TODO:' comments.
4.  **Connections (Edges)**:
    *   For 'edges' between nodes, represent these as comments within the dependent resource indicating the connection. E.g., in a web server resource: '# Connects to resource: user_database (aws_db_instance.user_database)'.
    *   Do not attempt to generate complex network configurations (VPCs, subnets, security groups) unless explicitly detailed in 'additionalRequirements'. Instead, add a general '# TODO: Define network resources (VPC, subnets, security groups) and associate resources appropriately.'
5.  **Output Structure**:
    *   Provide the HCL code in the 'terraformHcl' field.
    *   If components or properties cannot be mapped, or if critical information is missing, add specific messages to the 'warnings' array.
    *   Provide general advice for the user in the 'suggestions' array (e.g., "Review and complete all TODO comments.", "Define networking resources.", "Add security group rules.").
6.  **Placeholders and Simplification**:
    *   Use common defaults where appropriate but always with a '# TODO: Review default value' comment.
    *   Avoid highly complex or nested resource definitions unless they are very standard (e.g., a simple S3 bucket policy).
    *   Focus on generating a clear, understandable skeleton.

Example (AWS Web Server):
resource "aws_instance" "web_server_example" {
  # TODO: Specify an appropriate AMI ID for your region and OS
  ami           = "ami-0c55b31ad29f52035" # Example: Amazon Linux 2
  instance_type = "t2.micro" # Mapped from visual property 'instanceType' if available, otherwise default. TODO: Review instance type.

  # TODO: Configure security groups, subnet, IAM role, user data, etc.
  # Connects to resource: my_database (aws_db_instance.my_database)

  tags = {
    Name = "web-server-example" # Derived from node label
  }
}

Remember, the goal is to provide a helpful starting point, not a fully deployable configuration. Be explicit about limitations and areas requiring user input via comments and the 'warnings'/'suggestions' fields.
If a node type like "Info Note" is encountered, it should generally be ignored for HCL generation, or a warning can be added if it seems relevant.
If 'additionalRequirements' mentions specific resource names or configurations, try to incorporate them.
`,
});

const generateTerraformFlow = ai.defineFlow(
  {
    name: 'generateTerraformFlow',
    inputSchema: GenerateTerraformInputSchema,
    outputSchema: GenerateTerraformOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate Terraform HCL.');
    }
    return output;
  }
);

    