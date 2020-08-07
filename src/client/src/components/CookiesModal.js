import React, { Component } from 'react';
import { withStyles, Modal, Button, Typography } from '@material-ui/core';

const styles = theme => ({
  modal: {
    padding: '50px',
    backgroundColor: theme.palette.background.paper,
    position: 'absolute',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    minWidth: '300px',
  },
});

// Komponent prezentujący okno informujące o plikach cookies na stronie.
class CookiesModal extends Component {
  constructor(props) {
    super(props);
  }

  // Renderuje zawartość okna.
  render() {
    return <Modal open={this.props.open} onClose={() => this.props.close()}>
      <div className={this.props.classes.modal}>         
        <Typography>
          {this.props.global.resources.user_common_cookiesInfo}
        </Typography><br/>
        <Button onClick={() => this.props.close()}>{this.props.global.resources.user_common_cookiesOk}</Button>
      </div>
    </Modal>
  }
}

export default withStyles(styles)(CookiesModal);
