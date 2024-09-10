import { Upload, Empty, type UploadProps, message, Flex, Spin } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import FileCard, { type FileType } from "../../component/FileCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const { Dragger } = Upload



const props: UploadProps = {
    name: 'table',
    multiple: false,
    accept: '.xlsx',
    action: 'http://localhost:3000/files',
    showUploadList: false
};

const pageStyles: React.CSSProperties = {
    width: '90vw',
    height: '50vh',
}

function UploadPage() {
    const queryClient = useQueryClient()
    const navigate = useNavigate();
    const  { isPending, isError, data, error } = useQuery<FileType[]>({ 
        queryKey: ['files'], queryFn() {
            return fetch("http://localhost:3000/files").then((res) => res.json())
        },
        refetchOnWindowFocus: false,
    })

    const mutation = useMutation({
        mutationFn() {
            return Promise.resolve(true)
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['files'] })
        },
    })


    const onChange: UploadProps["onChange"] = (info) => {
        const { status } = info.file;
        if (status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
          mutation.mutate()
          console.log(info.file.response.uuid)
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed. ${info.file.response.error}`);
        }
    }

    const onDrop: UploadProps["onDrop"] = (e) => {
        console.log('Dropped files', e.dataTransfer.files);
    }


    return (
        <>
            <div className="home-page">
            {/* Header with button aligned to the right */}
            <header className="header-upload">
                <button className="header-button" onClick={() => {}}>Connect Wallet</button>
            </header>
          
            <div style={{display: 'grid', placeItems: "center", height:  "80vh"}}>
                <Spin spinning={isPending} >
                    <Flex wrap gap="middle">
                        {data && data.map((file) => (
                            <FileCard onEdit={() => {
                                navigate(`/files/${file.uuid}`)
                            }} key={file.uuid} file={file}/>
                        ))}
                        {isError && <div>{error.message}</div>}
                    </Flex>
                </Spin>
            
                <div style={pageStyles}>
                    {data && data.length <= 0 && <Empty style={{marginBottom: "20px"}}
                    imageStyle={{
                    height: 120,
                    }}
                    >
                    </Empty>}
                    <Dragger {...props} onChange={onChange} onDrop={onDrop}>
                        <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Support for a single file upload only. only csv files are allowed</p>
                    </Dragger>  
                </div>
            </div>
            </div>
        </>
    
    );
}





export default UploadPage