#!/bin/bash

# Set the path to your spark-submit binary if not in PATH
# SPARK_SUBMIT="/path/to/spark/bin/spark-submit"

APP_NAME="spark-pi"

# Define your Spark application's main class
MAIN_CLASS="org.apache.spark.examples.SparkPi"

APP_JAR="/opt/spark/examples/jars/spark-examples_2.12-3.5.0.jar"

# Set other Spark configurations and application arguments
APP_ARGS="1000"

K8S_NAMESPACE="spark-dev"
SERVICE_ACCOUNT="spark"
DOCKER_IMAGE="apache/spark:3.5.0"

FILE_UPLOAD_PATH="/tmp/spark-uploads"

# The command to submit the Spark job
spark-submit \
    --class $MAIN_CLASS \
    --master k8s://$KUBERNETES_API_SERVER_HOST:$KUBERNETES_API_SERVER_PORT \
    --deploy-mode cluster \
    --driver-cores 1 \
    --driver-memory 1g \
    --num-executors 1 \
    --executor-cores 1 \
    --executor-memory 1g \
    --name $APP_NAME \
    --conf spark.kubernetes.container.image=$DOCKER_IMAGE \
    --conf spark.kubernetes.namespace=$K8S_NAMESPACE \
    --conf spark.kubernetes.authenticate.driver.serviceAccountName=$SERVICE_ACCOUNT \
    --conf spark.kubernetes.authenticate.executor.serviceAccountName=$SERVICE_ACCOUNT \
    --conf spark.kubernetes.file.upload.path=$FILE_UPLOAD_PATH \
    --conf spark.kubernetes.driver.label.app=spark \
    --conf spark.kubernetes.driver.label.component=driver \
    local://$APP_JAR \
    $APP_ARGS



