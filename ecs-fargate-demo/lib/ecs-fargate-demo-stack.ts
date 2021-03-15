import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as route53 from '@aws-cdk/aws-route53';


export class EcsFargateDemoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const DN = 'www.indochat-osp.com';

        // The code that defines your stack goes here
        // 建立一個憑證給某的domain
        const cert = new acm.Certificate(this, 'Cert', {
            domainName: 'indochat-osp.com',
            subjectAlternativeNames: ['*.indochat-osp.com'],
            validationMethod: acm.ValidationMethod.DNS
        })

        // 創建listenner 需要一個vpc
        const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {isDefault: true})

        // 創建listenner 需要一個target group
        const tg = new elbv2.ApplicationTargetGroup(this, 'TG', {vpc: vpc, port: 80})

        // 創建一個listenner
        const listener = new elbv2.ApplicationListener(this, 'Listener', {
            loadBalancer: new elbv2.ApplicationLoadBalancer(this, 'ALB', {
                vpc: vpc, internetFacing: true
            }), // 賦予alb
            certificateArns: [cert.certificateArn], // 給予剛剛建立的憑證arn
            protocol: elbv2.ApplicationProtocol.HTTPS, // 指定要走的協定
            defaultTargetGroups: [tg],
        })

        // 建立好以上後就要開始建立你的服務, lambda, server, ecs etc.
        // 1. 建立cluster
        const cluster = new ecs.Cluster(this, 'Cluster', {vpc: vpc})

        // 建立task definition
        const taskDefinition = new ecs.TaskDefinition(this, 'TD', {
            compatibility: ecs.Compatibility.FARGATE,
            cpu: '256',
            memoryMiB: '512',
        })

        // task definition need image
        taskDefinition.addContainer('PHP', {
            image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
        }).addPortMappings({
            containerPort: 80,
        })

        const svc = new ecs.FargateService(this, 'SVC', {
            cluster: cluster,
            taskDefinition: taskDefinition,
        })

        /*
        // 這邊建立 autoscaling
        const scaling = svc.autoScaleTaskCount({ maxCapacity: 10 });
        scaling.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 50
        });

        scaling.scaleOnRequestCount('RequestScaling', {
            requestsPerTarget: 10000,
            targetGroup: tg
        })
         */

        tg.addTarget(svc)

        new cdk.CfnOutput(this, 'CMD', {
            value: `please CAME ${DN} to https://${listener.loadBalancer.loadBalancerDnsName}`
        })

        new cdk.CfnOutput(this, 'URL', {
            value: `${DN}`
        })

        // 選取要處理的domain
        const zone = route53.HostedZone.fromLookup(this, 'baseZone', {
            domainName: 'indochat-osp.com'
        })

        // 新增cname指向
        const cName = new route53.CnameRecord(this, 'test.baseZone', {
            zone: zone,
            recordName: DN, //要轉到的位置
            domainName: listener.loadBalancer.loadBalancerDnsName, // 本來位置
        });

    }
}
