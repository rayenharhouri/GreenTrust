import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button, Flex, Table } from 'antd';
import { FileType } from "../../component/FileCard";
import { DownloadOutlined } from "@ant-design/icons";
import { TableRowSelection } from "antd/es/table/interface";
import { useState } from "react";


function UploadPage() {
    const { uuid } = useParams();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);


    const columns = [
      {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
        fixed: "left"
      },
      {
        title: 'NumeroRegistro',
        dataIndex: 'NumeroRegistro',
        key: 'NumeroRegistro',
      },
      {
        title: 'CIF',
        dataIndex: 'CIF',
        key: 'CIF',
      },
      {
        title: 'RazonSocial',
        dataIndex: 'RazonSocial',
        key: 'RazonSocial',
      },
      {
        title: 'CodigoPlanta',
        dataIndex: 'CodigoPlanta',
        key: 'CodigoPlanta',
      },
      {
        title: 'CIL',
        dataIndex: 'CIL',
        key: 'CIL',
      },
      {
        title: 'Estado',
        dataIndex: 'Estado',
        key: 'Estado',
      },
      {
        title: 'Año',
        dataIndex: 'Ano',
        key: 'Ano',
      },
      {
        title: 'Mes',
        dataIndex: 'Mes',
        key: 'Mes',
      },
      {
        title: 'FechaInicio',
        dataIndex: 'FechaInicio',
        key: 'FechaInicio',
      },
      {
        title: 'FechaFin',
        dataIndex: 'FechaFin',
        key: 'FechaFin',
      },
      {
        title: 'FechaPresentacion',
        dataIndex: 'FechaPresentacion',
        key: 'FechaPresentacion',
      },
      {
        title: 'GarantiaSolicitada',
        dataIndex: 'GarantiaSolicitada',
        key: 'GarantiaSolicitada',
      },
      {
        title: 'TipoCesion',
        dataIndex: 'TipoCesion',
        key: 'TipoCesion',
      },
      {
        title: 'idContratoGDO',
        dataIndex: 'idContratoGDO',
        key: 'idContratoGDO',
      },
      {
        title: 'idDatosGestion',
        dataIndex: 'idDatosGestion',
        key: 'idDatosGestion',
      },
      {
        title: 'Potencia',
        dataIndex: 'Potencia',
        key: 'Potencia',
      },
      {
        title: 'Tecnologia',
        dataIndex: 'Tecnologia',
        key: 'Tecnologia',
      },
      {
        title: 'ExpedidaAnotada',
        dataIndex: 'ExpedidaAnotada',
        key: 'ExpedidaAnotada',
      },
      {
        title: 'ExpedidaTramite',
        dataIndex: 'ExpedidaTramite',
        key: 'ExpedidaTramite',
      },
      {
        title: 'NombreFicheroExcel',
        dataIndex: 'NombreFicheroExcel',
        key: 'NombreFicheroExcel',
      },
      {
        title: 'ID_Datatable',
        dataIndex: 'ID_Datatable',
        key: 'ID_Datatable',
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        fixed: 'right',
        render: (_: any, record: any) => {
          return <Button type="primary" icon={<DownloadOutlined />} size="large"  onClick={() => {
            fetch('http://localhost:3000/download', {
              body: JSON.stringify({keys: [record.id], uuid:uuid}),
              method: "POST",
              headers: {
                "content-type": "application/json"
              }
            }).then( res => res.blob() ).then( blob => {
              var file = window.URL.createObjectURL(blob);
              window.location.assign(file);
            });
          }}/>;
        },
      }
    ];


    const  { isPending, data } = useQuery<FileType[]>({ queryKey: ['file', uuid], async queryFn() {
        return await (await fetch(`http://localhost:3000/files/${uuid}`)).json()
    } })

    if(isPending) {
      return null;
    }

    function download(filename:string, url: string) {
      var element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
    
      element.click();
    
      document.body.removeChild(element);
    }

    const down = () => {
      setLoading(true);

      fetch('http://localhost:3000/download', {
        body: JSON.stringify({keys:selectedRowKeys, uuid: uuid}),
        method: "POST",
        headers: {
          "content-type": "application/json"
        }
      }).then( res => res.blob() ).then( blob => {
        var file = window.URL.createObjectURL(blob);
        download(uuid + ".xlsm", file)
        setLoading(false);
      });
      
      /*setTimeout(() => {
        setSelectedRowKeys([]);
        setLoading(false);
      }, 1000);*/
    };

    const hasSelected = selectedRowKeys.length > 0;

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
      console.log('selectedRowKeys changed: ', newSelectedRowKeys);
      setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<FileType> = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    return <Flex gap="middle" vertical>
    <Flex align="center" gap="middle">
      <Button type="primary" onClick={down} disabled={!hasSelected} loading={loading}>
        Download
      </Button>
      {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
    </Flex>
    <Table<FileType>  rowSelection={rowSelection} dataSource={data!} columns={columns} />
  </Flex>
}





export default UploadPage
