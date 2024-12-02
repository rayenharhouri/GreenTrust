import { EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const { Meta } = Card;

export type FileType = {
  uuid: string;
  filename: string;
  size: number;
}

const FileCard = ({file, onEdit}: {file: FileType, onEdit: React.MouseEventHandler<HTMLSpanElement>}) => (
  <Card
    style={{ width: 200 }}
    cover={
      <img
        alt="excel file icon"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeMZSX0EgLakv6R5u1NYxdPai8q0R-LbjzWg&s"
      />
    }
    actions={[
      <DownloadOutlined key="edit" onClick={onEdit}/>,
     
    ]}
  >
    <Meta
      title={file.filename}
      description="Click to download"
    />
  </Card>
);

export default FileCard;