import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import * as ec2 from '@aws-cdk/aws-ec2';

export class EksFargateDemoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here
        // 這邊就是用kubernetes的yaml to json的方式呈現
        // const appLabel = {app: "hello-kubernetes"}
        // const deployment = {
        //     apiVersion: "apps/v1",
        //     kind: "Deployment",
        //     metadata: {name: "hello-kubernetes"},
        //     spec: {
        //         replicas: 3,
        //         selector: {matchLabels: appLabel},
        //         template: {
        //             metadata: {labels: appLabel},
        //             spec: {
        //                 containers: [
        //                     {
        //                         name: "hello-kubernetes",
        //                         image: "paulbouwer/hello-kubernetes:1.5",
        //                         ports: [{containerPort: 8080}],
        //                     },
        //                 ],
        //             },
        //         },
        //     },
        // }
        //
        // const service = {
        //     apiVersion: "v1",
        //     kind: "Service",
        //     metadata: {name: "hello-kubernetes"},
        //     spec: {
        //         type: "LoadBalancer",
        //         ports: [{port: 80, targetPort: 8080}],
        //         selector: appLabel,
        //     },
        // }

        const mastersRole = new iam.Role(this, "mastersRole", {
            assumedBy: new iam.AccountRootPrincipal(),
        });

        const cluster = new eks.Cluster(this, "eks", {
            version: eks.KubernetesVersion.V1_19,
            defaultCapacity: 1,
            mastersRole,
            defaultCapacityInstance: new ec2.InstanceType("t3.large"),
        });

        // 用spot, 看價錢
        // cluster.addAutoScalingGroupCapacity("spot", {
        //     spotPrice: "0.1094",
        //     instanceType: new ec2.InstanceType("t3.large"),
        // });

        // cluster.addManifest("mypod", service, deployment);

        // new cdk.CfnOutput(this, "LoadBalancer", {
        //     value: cluster.getServiceLoadBalancerAddress("hello-kubernetes"),
        // });
    }
}
