import {Construct} from 'constructs';
import {App, Chart, ChartProps} from 'cdk8s';
import {KubeService, KubeDeployment, IntOrString, KubeConfigMap} from './imports/k8s';

export class MyChart extends Chart {
    constructor(scope: Construct, id: string, props: ChartProps = {}) {
        super(scope, id, props);

        // define resources here
        const label = {app: 'hello-k8s'};

        new KubeService(this, 'service', {
            spec: {
                type: 'LoadBalancer',
                ports: [{
                    port: 80,
                    targetPort: IntOrString.fromNumber(8080)
                }, {
                    port: 443,
                    targetPort: IntOrString.fromNumber(8080)
                }],
                selector: label
            },
            metadata: {
                name: 'my-service',
                labels: label
            },
        });

        new KubeConfigMap(this, 'config', {
            data: {
                key1: 'test1',
                key2: 'test2'
            },
            metadata: {
                name: 'my-config'
            }
        })

        new KubeDeployment(this, 'deployment', {
            spec: {
                replicas: 2,
                selector: {
                    matchLabels: label
                },
                template: {
                    metadata: {labels: label},
                    spec: {
                        containers: [
                            {
                                name: 'hello-kubernetes',
                                image: 'paulbouwer/hello-kubernetes:1.9',
                                ports: [{containerPort: 8080}]
                            }
                        ]
                    }
                }
            },
            metadata: {
                name: 'my-deployment'
            }
        });

        // 直接建立PoD
        // new KubePod(this, 'pod', {
        //     metadata: {
        //         name: 'my-pod',
        //         labels: label
        //     },
        //     spec: {
        //         containers: [
        //             {
        //                 name: 'hello-kubernetes-client-pod',
        //                 image: 'wrre/hello-kubernetes-client:v1',
        //                 ports: [{containerPort: 3000}]
        //             }
        //
        //         ]
        //     }
        // })

        // const helloDeployment = new kplus.Deployment(this, 'test', {
        //     containers: [
        //         {
        //             image: 'hashicorp/http-echo',
        //             args: ['-text', 'hello ingress']
        //         }
        //     ]
        // });
        //
        // const helloService = helloDeployment.expose(5678);
        // const ingress = new IngressV1Beta1(this, 'ingress');
        // ingress.addRule('/hello', kplus.IngressV1Beta1Backend.fromService(helloService));
    }
}

const app = new App();
new MyChart(app, 'cdk8s-demo');
app.synth();
