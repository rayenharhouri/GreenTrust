import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button, Flex, Input, InputRef, Space, Table, TableColumnType, DatePicker } from 'antd';
import { FileType } from "../../component/FileCard";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { FilterDropdownProps, TableRowSelection } from "antd/es/table/interface";
import { useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { DateTime } from "luxon";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

const { RangePicker } = DatePicker;

function UploadPage() {
    const { uuid } = useParams();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const searchInput = useRef<InputRef>(null);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [range, setRange] = useState<Array<dayjs.Dayjs> | null>(null)


    const handleSearch = (
      selectedKeys: string[],
      confirm: FilterDropdownProps['confirm'],
      dataIndex: string,
    ) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
    };
  
    const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: string): TableColumnType<FileType> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <Input
            ref={searchInput}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                confirm({ closeDropdown: false });
                setSearchText((selectedKeys as string[])[0]);
                setSearchedColumn(dataIndex);
              }}
            >
              Filter
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              close
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase()),
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
      render: (text) =>
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        ),
    });
  


    const  { isPending, data } = useQuery<RecordType[]>({ queryKey: ['file', uuid], async queryFn() {
        return (await (await fetch(`http://localhost:3000/files/${uuid}`)).json()).map(e => ({...e, FechaInicio: DateTime.fromMillis(Number(e.FechaInicio)).setLocale("es-ES"), FechaFin: DateTime.fromMillis(Number(e.FechaFin)).setLocale("es-ES")}))
    } })

    if(isPending) {
      return null;
    }
    const data_filtered = data!.filter((e) => {
      if(!range || !range[0] || !range[1]) return true;
      return dayjs(e.FechaInicio.toJSDate()).isBetween(range[0], range[1], "day", '[]')
    })

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
        body: JSON.stringify({keys:selectedRowKeys, rows:selectedRows, uuid: uuid}),
        method: "POST",
        headers: {
          "content-type": "application/json"
        }
      }).then( res => res.blob() ).then( blob => {
        var file = window.URL.createObjectURL(blob);
        download(Date.now() + ".xlsm", file)
        setLoading(false);
      });
    };

    const hasSelected = selectedRowKeys.length > 0;

    const onSelectChange = (newSelectedRowKeys: React.Key[], selection: unknown ) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows((selection as RecordType[]).map(e => e.CIF));
      console.log('selectedRows changed: ', selection);

    };

    const rowSelection: TableRowSelection<RecordType> = {
      selectedRowKeys,
      onChange: onSelectChange,
    };


    const columns = [
      {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
        fixed: "left",
        ...getColumnSearchProps('id'),
      },
      {
        title: 'CIF',
        dataIndex: 'CIF',
        key: 'CIF',
        ...getColumnSearchProps('CIF'),
      },
      {
        title: 'RazonSocial',
        dataIndex: 'RazonSocial',
        key: 'RazonSocial',
        ...getColumnSearchProps('RazonSocial'),
      },
      {
        title: 'CodigoPlanta',
        dataIndex: 'CodigoPlanta',
        key: 'CodigoPlanta',
        ...getColumnSearchProps('CodigoPlanta'),
      },
      {
        title: 'CIL',
        dataIndex: 'CIL',
        key: 'CIL',
        ...getColumnSearchProps('CIL'),
      },
      {
        title: 'Año',
        dataIndex: 'Año',
        key: 'Año',
        ...getColumnSearchProps('Año'),
      },
      {
        title: 'Mes',
        dataIndex: 'Mes',
        key: 'Mes',
        ...getColumnSearchProps('Mes'),
      },
      {
        title: 'FechaInicio',
        dataIndex: 'FechaInicio',
        key: 'FechaInicio',
        ...getColumnSearchProps('FechaInicio'),
      },
      {
        title: 'FechaFin',
        dataIndex: 'FechaFin',
        key: 'FechaFin',
        ...getColumnSearchProps('FechaFin'),
      },
      {
        title: 'GarantiaSolicitada',
        dataIndex: 'GarantiaSolicitada',
        key: 'GarantiaSolicitada',
        ...getColumnSearchProps('GarantiaSolicitada'),
      },
      {
        title: 'TipoCesion',
        dataIndex: 'TipoCesion',
        key: 'TipoCesion',
        ...getColumnSearchProps('TipoCesion'),
      },
      {
        title: 'idContratoGDO',
        dataIndex: 'idContratoGDO',
        key: 'idContratoGDO',
        ...getColumnSearchProps('idContratoGDO'),
      },
      {
        title: 'idDatosGestion',
        dataIndex: 'idDatosGestion',
        key: 'idDatosGestion',
        ...getColumnSearchProps('idDatosGestion'),
      },
      {
        title: 'Potencia',
        dataIndex: 'Potencia',
        key: 'Potencia',
        ...getColumnSearchProps('Potencia'),
      },
      {
        title: 'Tecnologia',
        dataIndex: 'Tecnologia',
        key: 'Tecnologia',
        ...getColumnSearchProps('Tecnologia'),
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        fixed: 'right',
        render: (_: any, record: RecordType) => {
          return <Button type="primary" icon={<DownloadOutlined />} size="large"  onClick={() => {
            fetch('http://localhost:3000/download', {
              body: JSON.stringify({keys: [record.id], rows: [record.CIF], uuid:uuid}),
              method: "POST",
              headers: {
                "content-type": "application/json"
              }
            }).then( res => res.blob() ).then( blob => {
              var file = window.URL.createObjectURL(blob);
              download(Date.now() + ".xlsm", file)
            });
          }}/>;
        },
      }
    ];    

    return <Flex gap="middle" vertical>
    <Flex align="center" gap="middle">
      <Button type="primary" onClick={down} disabled={!hasSelected} loading={loading}>
        Download
      </Button>
      {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
      <RangePicker value={range} onChange={(a) => {
        setRange(a)
      }}></RangePicker>
    </Flex>
    <Table<RecordType>  rowSelection={rowSelection} dataSource={data_filtered!.map(e => ({...e, FechaInicio: e.FechaInicio.toLocaleString(), FechaFin: e.FechaFin.toLocaleString()}))} columns={columns} />
  </Flex>
}

export type RecordType = {
  id: string,
  CIF: string,
  RazonSocial: string,
  CodigoPlanta: string,
  CIL: string,
  'Año': string,
  Mes: string,
  FechaInicio: DateTime,
  FechaFin: DateTime,
  GarantiaSolicitada: string,
  TipoCesion: string,
  idContratoGDO: string,
  idDatosGestion: string,
  Potencia: string,
  Tecnologia: string,
  NombreFicheroExcel: string,
  ID_Datatable: string
}



export default UploadPage
