import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import brown from '@material-ui/core/colors/brown';
import blueGrey from '@material-ui/core/colors/blueGrey';
import AppSnackbar from './AppSnackbar';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import Layout from './Layout';
import * as auth from '../auth/user';
import { get } from '../api/base';
import CookiesModal from './CookiesModal';

const theme = createMuiTheme({
  palette: {
    primary: blueGrey,
    secondary: brown
  },
  overrides: {
    MUIDataTableBodyRow: {
      root: {
        cursor: 'pointer'
      }
    }
  }
});

// Kontener zawierający stan globalny aplikacji oraz wyświetlający poszczególne jej elementy.
class App extends Component {
  constructor(props) {
    super(props);
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.changeResourcesPrefix = this.changeResourcesPrefix.bind(this);
    this.requestForResources = this.requestForResources.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.openSnackbar = this.openSnackbar.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.closeCookiesModal = this.closeCookiesModal.bind(this);

    this.state = {
      cookiesModalOpened: !localStorage.getItem('cookies') || localStorage.getItem('cookies') !== 'confirmed', 
      snackbarOpened: false,
      snackbarMessage: '',  
      currentLanguage: 'pl',
      resourcesPrefix: 'user',
      resourcesType: 'user',
      resources: [],
    }
  }

  // Ustawia wersje językową strony na podstawie ostatniego wyboru użytkownika.
  componentDidMount() {
    if (!localStorage.getItem('language')) {
      return;
    }
    this.setState({ currentLanguage: localStorage.getItem('language') });
  }

  // Otwiera okno informacyjne aplikacji.
  openSnackbar(text) {
    this.setState({ snackbarOpened: true, snackbarMessage: text });
  }

  // Zamyka okno informacyjne aplikacji.
  handleSnackbarClose() {
    this.setState({ snackbarOpened: false });
  }

  // Zamyka okno informacyjne aplikacji.
  closeSnackbar() {
    this.setState({ snackbarOpened: false });
  }

  // Zmienia wersję językową aplikacji.
  changeLanguage () {
    const currentLanguage = localStorage.getItem('language');
    let newLanguage;
    if (!currentLanguage) {
      newLanguage = 'pl';
    } else {
      newLanguage = currentLanguage === 'pl' ? 'en' : 'pl';
    }
    localStorage.setItem('language', newLanguage);

    const isAdmin = auth.isUserAdmin();
    this.setState({currentLanguage: newLanguage }, () => { this.requestForResources(isAdmin) });
  }

  // Wysyła żądanie dotyczące fraz wyświetlanych w interfejsie, w zależności od aktualnie wybranego języka strony i podstrony, na której znajduje się użytkownik. 
  requestForResources () { 
    let currentLanguage = localStorage.getItem('language');  
    if (!currentLanguage) {
      currentLanguage = 'pl';
    }

    const path = this.state.resourcesType 
      ? `/api/resources/admin/${currentLanguage}/${this.state.resourcesPrefix}` 
      : `/api/resources/${currentLanguage}/${this.state.resourcesPrefix}`;
              
    get(path).then(response => {
      switch (true) {            
        case response.status === 200:             
          return response.json()
            .then(json => {  
              const resources = json.content.resources;
              this.setState({ resources: resources });
            });
          
        default:
          this.openSnackbar('Server Error');
          break;
      }
    });
  }

  // Sprawdza, czy użytkownik próbujący wyświetlić panel administracyjny jest zalogowany jako administrator.
  handleAuthentication(props, global) {
    if (!auth.getJwt() || auth.isJwtExpired() || !auth.isUserAdmin()) {
      return <Redirect to="/admin_login" />;
    }
                  
    return <AdminLayout global={global} {...props} />
  }

  // Zmienia informację o frazach, jakie powinny być aktualnie wyświetlane w interfejsie użytkownika.
  changeResourcesPrefix (prefix, isAdmin)  {
    this.setState({ resourcesPrefix: prefix, resourcesType: isAdmin }, () => { this.requestForResources(isAdmin); });
  }

  // Zamyka okno z informacją o cookies.
  closeCookiesModal() {
    localStorage.setItem('cookies', 'confirmed');
    this.setState({ cookiesModalOpened: false })
  }

  // Renderuje zawartość komponentu oraz przekazuje innym komponentom stan globalny aplikacji.
  render() {
    let global = {
      snackbarOpened: this.state.snackbarOpened,
      snackbarMessage: this.state.snackbarMessage,
      currentLanguage: this.state.currentLanguage,      
      resources: this.state.resources,
      resourcesPrefix: this.state.resourcesPrefix,

      changeLanguage: this.changeLanguage,
      changeResourcesPrefix: this.changeResourcesPrefix,
      openSnackbar: this.openSnackbar,
      closeSnackbar: this.closeSnackbar,
    };

    return <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppSnackbar global={global} />
      <CookiesModal open={this.state.cookiesModalOpened} close={this.closeCookiesModal} global={global}/>
      <BrowserRouter>
        <Switch>
          <Route exact path="/admin_login" render={props => <AdminLogin global={global} {...props} />} />
          <Route path="/admin" render={props => this.handleAuthentication(props, global)} />
          <Route path="/" render={props => <Layout global={global} {...props}/>}/> 
        </Switch>
      </BrowserRouter>
    </MuiThemeProvider>;
  }
}

export default App;
