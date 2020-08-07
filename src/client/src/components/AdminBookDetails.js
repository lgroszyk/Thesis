import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import AdminBookForm from './AdminBookForm';

const styles = theme => ({
  formContainer: {
    margin: '20px'
  }
});

// Zwraca formularz dotyczący książki w formie zależnej od otrzymanych właściwości.
class AdminBookDetails extends Component {
  constructor(props) {
    super(props);
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('bookdetails', true);
  }

  // Zwraca odpowiedni formularz dotyczący ksiązki.
  render() {
    return <React.Fragment>
      <div className={this.props.classes.formContainer}>
        {this.props.add
          ? <AdminBookForm add id={0} global={this.props.global} {...this.props} />
          : <AdminBookForm edit delete id={this.props.match.params.id} global={this.props.global} {...this.props} />}
      </div>
    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminBookDetails);
