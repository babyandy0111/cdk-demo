## How to using CDK
* check your node and npm version (recommend using nvm)
  * nvm: https://titangene.github.io/article/nvm.html
  * `node -v && npm -v` 
  * > v15.11.0
  * > 7.6.0

* install & check cdk 
  * `npm install -g aws-cdk && cdk --version`
  * > 1.91.0 (build 0f728ce)

* check your aws cli
  * install: https://docs.aws.amazon.com/cli/latest/userguide/install-macos.html
  * ```
    curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
    && unzip awscli-bundle.zip
    && sudo ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws
    ```
  * configuration: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
  * ```
    aws configure
    AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
    AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    Default region name [None]: us-west-2
    Default output format [None]: json 
    ```
    

    

## Useful commands
* cd [Project Demo Name]
* `npm install`   compile typescript to js
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Project description
* ecs-fargate-demo
  * fargate
* eks-fargate-demo
  * kubernetes + fargate
* lambda-demo
  * golang demo
  * node demo

