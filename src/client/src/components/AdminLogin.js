import React, { Component } from 'react';
import { withStyles, Card, CardContent, Button, TextField, Typography } from '@material-ui/core';
import { post } from '../api/base';
import { setJwt } from '../auth/user';

const styles = theme => ({
  card: {
    position:'absolute',
    margin: 'auto',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    maxWidth: '300px',
    height: '400px'
  },
  cardTextFieldsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
});

// Podstrona z formularzem do logowania do panelu administracyjnego strony.
class AdminLogin extends Component {
  constructor(props) {
    super(props);

    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logIn = this.logIn.bind(this);

    this.state = {
      username: '',
      password: ''
    }
  }

  // Pobiera z serwera frazy w zależności od wersji językowej strony.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('admlogin', false);
  }

  // Dokonuje próby zalogowania na konto użytkownika.
  logIn() {
    post('/api/user/login', { username: this.state.username, password: this.state.password })
      .then(response => {
        switch (true) { 

          case response.status === 200:             
            return response.text().then(data => { 
              setJwt(data); 
              this.props.history.push('admin');
            });

          case response.status === 400:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_400);
            break;

          case response.status === 401:
            this.props.global.openSnackbar(this.props.global.resources.user_admlogin_baddata);
            break;
            
          default:
            this.props.global.openSnackbar(this.props.global.resources.admin_common_errors_500);
            break;

        }
      });
  }

  // Aktualizuje stan komponentu w zakresie nazwy użytkownika.
  changeUsername(username) {
    this.setState({ username: username });
  } 

  // Aktualizuje stan komponentu w zakresie hasłą użytkownika.
  changePassword(password) {
    this.setState({ password: password });
  }

  // Renderuje zawartość podstrony.
  render() {
    return <Card className={this.props.classes.card}>
      <CardContent>
        <div className={this.props.classes.cardTextFieldsWrapper}>
          <br/><br/><Typography variant={'headline'} align={'center'}>
            {this.props.global.resources.user_admlogin_header}
          </Typography><br/>
          <TextField label={this.props.global.resources.user_admlogin_username}
            onBlur={(event) => this.changeUsername(event.target.value)} /><br/>
          <TextField type="password" label={this.props.global.resources.user_admlogin_password}
            onBlur={(event) => this.changePassword(event.target.value)} /><br/><br/>
          <Button size="small" color="primary" onClick={() => this.logIn()}>
            {this.props.global.resources.user_admlogin_login}
          </Button>
        </div>
      </CardContent>
    </Card>;
  }
}

export default withStyles(styles)(AdminLogin);
