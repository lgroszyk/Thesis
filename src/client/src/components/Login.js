import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { TextField, Button, Typography, FormControl } from '@material-ui/core';
import validator from 'validator';
import { post } from '../api/base';
import { setJwt } from '../auth/user';

// Formularz logowania na konto użytkownika
class Login extends Component {
  constructor(props) {
    super(props);

    this.changeUsername = this.changeUsername.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logIn = this.logIn.bind(this);
    this.validate = this.validate.bind(this);

    this.state = {
      username: '',
      password: ''
    }
  }

  // Pobiera z serwera odpowiednie frazy do wyświetlenia na podstronie.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('login', false);
  }

  // Sprawdza formę nazwy i hasła wpisanych przez użytkownika.
  validate() {
    this.setState({ validationError: false, passwordError: false, usernameError: false });

    if (!this.state.username || !validator.isLength(this.state.username, { min: 1, max: 16 })) {
      this.setState({ validationError: true, usernameError: true })
    }
    if (!this.state.password || !validator.isLength(this.state.password, { min: 1, max: 64 })) {
      this.setState({ validationError: true, passwordError: true })
    }
  }

  // Loguje użytkownika.
  logIn() {
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation);
        return;
      }  

      post('/api/user/login', { username: this.state.username, password: this.state.password })
        .then(response => {
          switch (true) { 

            case response.status === 200:             
              return response.text().then(data => { 
                setJwt(data); 
                this.props.history.push('/');
              });

            case response.status === 400:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_400);
              break;

            case response.status === 401:
              this.props.global.openSnackbar(this.props.global.resources.user_login_errors_baddata);
              break;

            case response.status === 403:
            this.props.global.openSnackbar(this.props.global.resources.user_login_errors_confirmemail);
              break;
              
            default:
              this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
              break;

          }
        });
    }, 1000);
  }

  // Aktualizuje stan komponentu w zakresie nazwy użytkownika.
  changeUsername(username) {
    this.setState({ username: username });
  } 

  // Aktualizuje stan komponentu w zakresie hasła użytkownika.
  changePassword(password) {
    this.setState({ password: password });
  }

  // Renderuje formularz.
  render() {
    return <div>
      <FormControl>
        <TextField label={this.props.global.resources.user_login_username} onBlur={(event) => this.changeUsername(event.target.value)} />
        {this.state.usernameError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_login_usernameError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField type="password" label={this.props.global.resources.user_login_password} onBlur={(event) => this.changePassword(event.target.value)} />
        {this.state.passwordError ? <Typography color={'error'} variant={'caption'}>{this.props.global.resources.user_login_passwordError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <Button size="small" color="primary" onClick={() => this.logIn()}>
          {this.props.global.resources.user_login_login}
        </Button>
      </FormControl><br/><br/>

      <Link to={'/register'}>
        <Typography>
          {this.props.global.resources.user_login_register}
        </Typography>
      </Link><br/><br/>
    </div>;
  }
}

export default Login;
