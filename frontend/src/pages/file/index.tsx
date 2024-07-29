import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button, Table } from 'antd';
import { FileType } from "../../component/FileCard";
import { DownloadOutlined } from "@ant-design/icons";

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
          body: JSON.stringify(record),
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

function UploadPage() {
    const { uuid } = useParams();

    const  { isPending, data } = useQuery<FileType[]>({ queryKey: ['file', uuid], async queryFn() {
        return await (await fetch(`http://localhost:3000/files/${uuid}`)).json()
    } })

    if(isPending) {
      return null;
    }

    return <div style={{
      width: '100vw',
      height: '100vh',
    }}><Table<FileType>  dataSource={data!} columns={columns} /></div>
}





export default UploadPage
