# VirtualDesktop-CC

## Elastic-Beanstalk Deployment
### Setup in AWS
#### Credetnials for the EB-CLI-Tool
### LocalDeploy Pre-Requirements
- ElasticBeanstalk Deployment CLI Tool
    - `` pip install awsebcli ``
    - Navigate to Project Repo do 
    ``eb init --platform node.js --region eu-central-1 VirtualDesktop`` 
    and ``eb create --sample VirtualDesktop-env`` 
    - Source From "https://docs.aws.amazon.com/en_en/elasticbeanstalk/latest/dg/create_deploy_nodejs_express.html"
        This command creates a load balanced environment with the default settings for the Node.js platform and the following resources:
        - EC2 instance – An Amazon Elastic Compute Cloud (Amazon EC2) virtual machine configured to run web apps on the platform that you choose.
        - Each platform runs a specific set of software, configuration files, and scripts to support a specific language version, framework, web container, or combination thereof. Most platforms use either Apache or nginx as a reverse proxy that sits in front of your web app, forwards requests to it, serves static assets, and generates access and error logs.
        - Instance security group – An Amazon EC2 security group configured to allow ingress on port 80. This resource lets HTTP traffic from the load balancer reach the EC2 instance running your web app. By default, traffic isn't allowed on other ports.
        - Load balancer – An Elastic Load Balancing load balancer configured to distribute requests to the instances running your application. A load balancer also eliminates the need to expose your instances directly to the internet.
        - Load balancer security group – An Amazon EC2 security group configured to allow ingress on port 80. This resource lets HTTP traffic from the internet reach the load balancer. By default, traffic isn't allowed on other ports.
        - Auto Scaling group – An Auto Scaling group configured to replace an instance if it is terminated or becomes unavailable.
        - Amazon S3 bucket – A storage location for your source code, logs, and other artifacts that are created when you use Elastic Beanstalk.
        - Amazon CloudWatch alarms – Two CloudWatch alarms that monitor the load on the instances in your environment and are triggered if the load is too high or too low. When an alarm is triggered, your Auto Scaling group scales up or down in response.
        - AWS CloudFormation stack – Elastic Beanstalk uses AWS CloudFormation to launch the resources in your environment and propagate configuration changes. The resources are defined in a template that you can view in the AWS CloudFormation console.
        - Domain name – A domain name that routes to your web app in the form subdomain.region.elasticbeanstalk.com.
    - Open in default Browser with ``eb open``
    - To see elastic Beans Instance visit: https://eu-central-1.console.aws.amazon.com/elasticbeanstalk/home?region=eu-central-1#/applications
### Deployment on AWS
- Start Depoloyment with ``eb deploy``
- When you're done working, terminate with ``eb terminate``