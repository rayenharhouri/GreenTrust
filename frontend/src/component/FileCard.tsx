import { EditOutlined, EllipsisOutlined } from '@ant-design/icons';
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
      <EditOutlined key="edit" onClick={onEdit}/>,
      <EllipsisOutlined key="ellipsis" />,
    ]}
  >
    <Meta
      title={file.filename}
      description="This is the description"
    />
  </Card>
);

export default FileCard;