import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from "@aws-cdk/aws-ec2";

export class EksFargateDemoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        // 這邊就是用kubernetes的yaml to json的方式呈現
        const appLabel = {app: "hello-kubernetes"}
        const deployment = {
            apiVersion: "apps/v1",
            kind: "Deployment",
            metadata: {name: "hello-kubernetes"},
            spec: {
                replicas: 1,
                selector: {matchLabels: appLabel},
                template: {
                    metadata: {labels: appLabel},
                    spec: {
                        containers: [
                            {
                                name: "hello-kubernetes",
                                image: "paulbouwer/hello-kubernetes:1.5",
                                ports: [{containerPort: 8080}],
                            },
                        ],
                    },
                },
            },
        }
        const service = {
            apiVersion: "v1",
            kind: "Service",
            metadata: {name: "hello-kubernetes"},
            spec: {
                type: "LoadBalancer",
                ports: [{port: 80, targetPort: 8080}],
                selector: appLabel,
            },
        }

        const mastersRole = new iam.Role(this, "adminRole", {
            assumedBy: new iam.AccountRootPrincipal(),
        });

        // Fargate
        // const cluster = new eks.FargateCluster(this, 'EksFargateCluster', {
        //     version: eks.KubernetesVersion.V1_19,
        //     mastersRole: mastersRole,
        //     outputClusterName: true,
        //     outputMastersRoleArn: true,
        //     outputConfigCommand: true,
        //     vpc: vpc,
        //     defaultProfile: {
        //         selectors: [
        //             {namespace: 'default'},
        //             {namespace: 'kube-system'},
        //             {namespace: 'demo', labels: appLabel},
        //         ],
        //     }
        // })

        // ec2
        const cluster = new eks.Cluster(this, "EksCluster", {
            version: eks.KubernetesVersion.V1_19,
            defaultCapacity: 1,
            mastersRole,
            defaultCapacityInstance: new ec2.InstanceType("t3.small"),
        })

        // 用spot, 看價錢
        // cluster.addAutoScalingGroupCapacity("spot", {
        //     spotPrice: "0.1094",
        //     instanceType: new ec2.InstanceType("t3.large"),
        // });

        cluster.addManifest("EksClusterManifest", service, deployment);

        new cdk.CfnOutput(this, "hello-kubernetes-LoadBalancer", {
            value: cluster.getServiceLoadBalancerAddress("hello-kubernetes"),
        });
    }
}
