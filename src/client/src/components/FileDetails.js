import React, { Component } from 'react';
import { withStyles, TextField, FormControl, Button } from '@material-ui/core';
import { getById } from '../api/base';
import download from 'downloadjs';

const styles = theme => ({
  input: {
    minWidth: '300px'
  }
});

class FileDetails extends Component {
  constructor(props) {
    super(props);

    this.downloadFile = this.downloadFile.bind(this);

    this.state = { };
  }

  // Pobiera z serwera dane na temat konkretnego ebooka zakupionego przez użytkownika.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('filedetails', false);

    getById('/api/books/my/ebook', this.props.match.params.id).then(response => {
      switch (response.status) {
        
        case 200:
          return response.json().then(data => this.setState({ file: data, fileLoaded: true, currentFilename: data.name }));
  
        case 404:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404);
          this.props.history.push('/account');
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          this.props.history.push('/account');
          break;
      }
    });
  }

  // Pobiera udostępnionego ebooka.
  downloadFile() {
    getById('/api/books/my/ebook/download', this.props.match.params.id).then(response => {
      switch (response.status) {
        
        case 200:
          return response.blob().then(blob => download(blob, this.state.currentFilename));

        case 404:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_404);
          this.props.history.push('/account');
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          this.props.history.push('/account');
          break;
      }
    });
  }

  // Renderuje zawartość komponentu.
  render() {
    return this.state.fileLoaded ? <React.Fragment>

      <FormControl>
        <TextField disabled className={this.props.classes.input} type={'text'} value={this.state.file.name} label={this.props.global.resources.user_filedetails_name} />
      </FormControl><br/><br/>

      <FormControl>
        <Button onClick={() => this.downloadFile()}>{this.props.global.resources.user_filedetails_downloadFile}</Button>
      </FormControl>
    </React.Fragment> : false;
  }
}

export default withStyles(styles)(FileDetails);
