import React, { Component } from 'react';
import { withStyles, CircularProgress } from '@material-ui/core';

const styles = theme => ({
  progress: {
    margin: '10px'
  }
});

// Komponent wskazujący na ładowanie treści do wyświetlenia jej na danej podstronie.
class LoadingIndicator extends Component {

  // Renderuje zawartość komponentu.
  render() {
    return <CircularProgress className={this.props.classes.progress}/>;
  }
}

export default withStyles(styles)(LoadingIndicator);
