require('dotenv').config();
const S3 = require('aws-sdk/clients/s3');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// s3 객체 생성
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// s3에 이미지 파일 업로드
function uploadFile(file: any): Promise<any> {
  const uploadParams = {
    Bucket: bucketName,
    Body: file.body,
    Key: file.filename,
    ContentType: file.type,
  };
  return s3.upload(uploadParams).promise();
}

// s3에서 이미지 파일 다운로드
function downloadFile(fileKey: any) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

export { uploadFile, downloadFile };
