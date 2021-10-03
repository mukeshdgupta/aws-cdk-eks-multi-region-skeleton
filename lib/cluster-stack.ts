import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";
import * as ec2 from "@aws-cdk/aws-ec2";
import { PhysicalName } from "@aws-cdk/core";

export class ClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const primaryRegion = "us-west-1";

    const clusterAdmin = new iam.Role(this, "AdminRole", {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    const cluster = new eks.Cluster(this, "demogo-cluster", {
      clusterName: `demogo`,
      mastersRole: clusterAdmin,
      version: eks.KubernetesVersion.V1_21,
      defaultCapacity: 2,
    });

    cluster.addAutoScalingGroupCapacity("spot-group", {
      instanceType: new ec2.InstanceType("m5.xlarge"),
      spotPrice: cdk.Stack.of(this).region == primaryRegion ? "0.248" : "0.192",
    });

    this.cluster = cluster;
  }
}

function createDeployRole(
  scope: cdk.Construct,
  id: string,
  cluster: eks.Cluster
): iam.Role {
  const role = new iam.Role(scope, id, {
    roleName: PhysicalName.GENERATE_IF_NEEDED,
    assumedBy: new iam.AccountRootPrincipal(),
  });
  cluster.awsAuth.addMastersRole(role);

  return role;
}

export interface EksProps extends cdk.StackProps {
  cluster: eks.Cluster;
}
