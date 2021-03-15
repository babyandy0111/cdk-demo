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
    AWS Access Key ID [None]: ******
    AWS Secret Access Key [None]: ********
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
* eck8s-demo
  * create yaml file

## ArgoCD
* install ArgoCD
  * `kubectl create namespace argocd`
  * `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml`
* install Argo-Cli
  * `brew install argocd`
  
## ArgoCD login
* you must export your pod name, pod name is your password 
  * `kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o name | cut -d'/' -f 2`
* login
  * `argocd login <ARGOCD_SERVER>`  # e.g. 127.0.0.1:8080
* change the password using the command
  * `argocd account update-password`

## export ArgoCD service
* export service
  * `kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'`
  * `kubectl get svc argocd-server -n argocd -o json | jq --raw-output .status.loadBalancer.ingress[0].hostname`
  * you will see lb endpoint, you must install jq (brew install jq)
  * if you using and got "zsh: no matches found" msg, just add `setopt no_nomatch` to ~/.zshrc and `source ~/.zshrc`

* or Using Port Forwarding
  * kubectl port-forward svc/argocd-server -n argocd 8080:443
  * open localhost:8080
