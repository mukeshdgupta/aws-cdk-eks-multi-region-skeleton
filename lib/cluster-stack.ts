import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as eks from "@aws-cdk/aws-eks";
import * as ec2 from "@aws-cdk/aws-ec2";
import { PhysicalName } from "@aws-cdk/core";

export class ClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;
  public readonly firstRegionRole: iam.Role;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const primaryRegion = "us-west-1";
    // Cluster stack
    const clusterAdmin = new iam.Role(this, "AdminRole", {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    const cluster = new eks.Cluster(this, "petclinic-cluster", {
      clusterName: `petclinic`,
      mastersRole: clusterAdmin,
      version: eks.KubernetesVersion.V1_21,
      defaultCapacity: 1,
    });
    /*
    cluster.addAutoScalingGroupCapacity('spot-group', {
      instanceType: new ec2.InstanceType('m5.xlarge'),
      spotPrice: cdk.Stack.of(this).region==primaryRegion ? '0.248' : '0.192'
    });
    */
    cluster.addAutoScalingGroupCapacity("frontend-nodes", {
      instanceType: new ec2.InstanceType("t2.medium"),
      minCapacity: 2,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });
    this.cluster = cluster;
    if (cdk.Stack.of(this).region == primaryRegion)
      this.firstRegionRole = createDeployRole(this, `for-1st-region`, cluster);
  }
}

function createDeployRole(scope: cdk.Construct, id: string, cluster: eks.Cluster): iam.Role {
  const role = new iam.Role(scope, id, {
    roleName: PhysicalName.GENERATE_IF_NEEDED,
    assumedBy: new iam.AccountRootPrincipal()
  });
  role.addToPolicy(new iam.PolicyStatement({
  resources: ['*'],
  actions: ['securityhub:*'],
  }));
  
  cluster.awsAuth.addMastersRole(role);

  return role;
}
export interface EksProps extends cdk.StackProps {
  cluster: eks.Cluster
}

export interface CicdProps extends cdk.StackProps {
  firstRegionCluster: eks.Cluster;
  firstRegionRole: iam.Role;
}
