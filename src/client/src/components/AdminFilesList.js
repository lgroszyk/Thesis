import React, { Component } from 'react';
import { withStyles, Button, FormControl } from '@material-ui/core';
import MUIDataTable from "mui-datatables";
import { get } from '../api/base';
import { getJwt } from '../auth/user';

const styles = theme => ({
  fileinput: {
    display: 'none'
  }
});

// Podstrona panelu administracyjnego wyświetlająca listę plików na serwerze.
class AdminFilesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie oraz dane dotyczące plików.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('fileslist', true);

    get('/api/books/files').then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ files: data.map(x => ({
              id: x.id,
              name: x.name,
              uploadDate: x.uploadDate.substring(0,10)
            })) });
          });

        default:
          this.setState({ files: [], filesLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
          break;
      }
    });
  }

  // Otwiera szczegóły wybranego pliku.
  open(data) {
    const id = data[0];
    this.props.history.push(`/admin/file/details/${id}`);
  }

  // Wgrywa na serwer nowy plik.
  addFile(files) {
    if (!files) {
      return;
    }

    let formData = new FormData();
    formData.append("file", files[0]);

    fetch('/api/books/file/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getJwt()}`
      },
      body: formData
    }).then(response => {
      switch (response.status) {
        case 204:
          this.props.global.openSnackbar(this.props.global.resources.admin_fileslist_added)
          get('/api/books/files').then(response => {
            switch (true) { 
      
              case response.status === 200:    
                return response.json().then(data => { 
                  this.setState({ files: data.map(x => ({
                    id: x.id,
                    name: x.name,
                    uploadDate: x.uploadDate.substring(0,10)
                  })) });
                });
      
              default:
                this.setState({ files: [], filesLoading: false });
                this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
                break;
            }
          });
          break;

        case 400:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
          break;
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500)
          this.props.history.push('/admin/files');
          break;
      }
    });
  }
 
  // Renderuje zawartość podstrony.
  render() {
    const columns = [
      {
        name: "id",
        options: {
          display: 'excluded',
          filter: false,
          sort: false,
        }
      },
      {
        name: "name",
        label: this.props.global.resources.admin_fileslist_name,
        options: {
          filter: false,
          sort: true,
        }
      },
      {
        name: "uploadDate",
        label: this.props.global.resources.admin_fileslist_uploadDate,
        options: {
          filter: false,
          sort: true,
        }
      },
    ];
    const options = {
      textLabels: {
        body: {
          noMatch: this.props.global.resources.admin_common_muidatatable_body_noMatch,
          toolTip: this.props.global.resources.admin_common_muidatatable_body_toolTip,
        },
        pagination: {
          next: this.props.global.resources.admin_common_muidatatable_pagination_next,
          previous: this.props.global.resources.admin_common_muidatatable_pagination_previous,
          rowsPerPage: this.props.global.resources.admin_common_muidatatable_pagination_rowsPerPage,
          displayRows: this.props.global.resources.admin_common_muidatatable_pagination_displayRows,
        },
        toolbar: {
          search: this.props.global.resources.admin_common_muidatatable_toolbar_search,
          viewColumns: this.props.global.resources.admin_common_muidatatable_toolbar_viewColumns,
          filterTable: this.props.global.resources.admin_common_muidatatable_toolbar_filterTable,
        },
        filter: {
          all: this.props.global.resources.admin_common_muidatatable_filter_all,
          title: this.props.global.resources.admin_common_muidatatable_filter_title,
          reset: this.props.global.resources.admin_common_muidatatable_filter_reset,
        },
        viewColumns: {
          title: this.props.global.resources.admin_common_muidatatable_viewColumns_title,
          titleAria: this.props.global.resources.admin_common_muidatatable_viewColumns_titleAria,
        },
      },
      selectableRows: false,
      filterType: 'checkbox',
      responsive: 'scroll',
      download: false,
      print: false,
      filter: false,     
      onRowClick: (rowData) => this.open(rowData)
    }
    
    return <React.Fragment>
      <FormControl>
        <Button component="label">
          {this.props.global.resources.admin_fileslist_addFile}
          <input type="file" accept=".pdf,.epub,.mobi" className={this.props.classes.fileinput} onChange={e => this.addFile(e.target.files)} />
        </Button>
      </FormControl><br/>
      <MUIDataTable
        data={this.state.files}
        columns={columns}
        options={options} />
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminFilesList);
