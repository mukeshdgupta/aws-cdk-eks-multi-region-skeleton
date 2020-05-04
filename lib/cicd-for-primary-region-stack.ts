import * as cdk from '@aws-cdk/core';
import codecommit = require('@aws-cdk/aws-codecommit');
import ecr = require('@aws-cdk/aws-ecr');
import codebuild = require('@aws-cdk/aws-codebuild');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import pipelineAction = require('@aws-cdk/aws-codepipeline-actions');
import * as iam from '@aws-cdk/aws-iam';
import { codeToECRspec, deployToEKSspec, deployTo2ndClusterspec } from '../utils/buildspecs';

export class CicdForPrimaryRegionStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

    }
}

