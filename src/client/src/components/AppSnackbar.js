import React, { Component } from 'react';
import { withStyles, Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  messageWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  messageText: {
    marginLeft: '5px'
  }
});

// Komponent prezentujący okno do wyświetlania informacji o wynikach działań podjętych przez użytkownika na stronie.
class AppSnackbar extends Component {
  constructor(props) {
    super(props);

    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
  }

  // Zamyka okno.
  handleSnackbarClose() {
    this.props.global.closeSnackbar();
  }

  // Renderuje zawartość okna informacyjnego.
  render() {
    return  <Snackbar open={this.props.global.snackbarOpened}
      onClose={() => this.handleSnackbarClose()} 
      autoHideDuration={5000}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>

      <SnackbarContent className={this.props.classes.snackbar}           
        message={
          <span className={this.props.classes.messageWrapper}>
            <span className={this.props.classes.messageText}>
              {this.props.global.snackbarMessage}
            </span>              
          </span>}
        action={
          <IconButton color="inherit" onClick={() => this.handleSnackbarClose()}>
            <CloseIcon />
          </IconButton>} 
        />

    </Snackbar>
  }
}

export default withStyles(styles)(AppSnackbar);
