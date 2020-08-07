import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { withStyles, AppBar, Toolbar, Button, IconButton, Paper, Hidden, Drawer, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { isLoggedIn, removeJwt } from '../auth/user';
import Books from './Books';
import BookDetails from './BookDetails';
import News from './News';
import NewsDetails from './NewsDetails';
import Login from './Login';
import Register from './Register';
import Cart from './Cart';
import Offer from './Offer';
import User from './User';
import ConfirmAccount from './ConfirmAccount';
import PaymentConfirmator from './PaymentConfirmator';
import OrderDetails from './OrderDetails';
import OfferDetails from './OfferDetails';
import FileDetails from './FileDetails';
import Info from './Info';
import Rules from './Rules';

const styles = theme => ({
  main: {
    minHeight: '100vh',
    width: '100%',
    margin: '0',
    padding: '80px 30px 30px 30px',
    border: 'none',
    borderRadius: '0',
    backgroundColor: theme.palette.background.paper,
    
    [theme.breakpoints.up(1200)]: {
      width: '1200px',
      margin: '0 auto'
    },

    [theme.breakpoints.down('xs')]: {
      padding: '70px 10px 10px 10px'
    }
  },
  footer: {
    height: '50px',
    backgroundColor: '#e5e5e5',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '10px'
  },
  link: {
    color: 'inherit',
    textDecoration: 'none'
  },
  right: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  drawerContent: {
    padding: '10px'
  }
});

// Kontener na podstrony części publicznej aplikacji
class Layout extends Component {
  constructor(props) {
    super(props);

    this.handleButtonLanguageClick = this.handleButtonLanguageClick.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.renderLanguageIcon = this.renderLanguageIcon.bind(this);
    this.renderUserPart = this.renderUserPart.bind(this);
    this.renderCommonPart = this.renderCommonPart.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);

    this.state = { };
  }

  // Otwiera menu główne strony (jeśli jest ona wyświetlana na smartfonie lub tablecie).
  openMenu() {
    this.setState({ menuOpened: true })
  }

  // Zamyka menu główne strony.
  closeMenu() {
    this.setState({ menuOpened: false })
  }

  // Wylogowuje użytkownika.
  handleLogOut() {
    removeJwt();
    this.closeMenu();
    localStorage.setItem('cart', JSON.stringify([]));
    this.props.history.push('/');
  }

  // Zmienia wersję językową strony.
  handleButtonLanguageClick() {
    this.props.global.changeLanguage();
  }

  // Renderuje ikonkę flagi, której naciśnięcie powoduje zmianę wersji językowej strony na język reprezentowany przez flagę.
  renderLanguageIcon() {
    const path = this.props.global.currentLanguage === 'pl' ? '/gb.png' : '/pl.png';
    return <img src={path} height={18} width={24} />
  }

  // Renderuje część menu głównego strony dostępną dla każdego, kto wyświetla stronę.
  renderCommonPart() {
    return <React.Fragment>
      <Button color="inherit" onClick={() => this.closeMenu()}>
        <Link to='/books' className={this.props.classes.link}>
          {this.props.global.resources.user_common_menu_books}
        </Link>
      </Button>
      <Hidden lgUp><br/></Hidden>

      <Button color="inherit" onClick={() => this.closeMenu()}>
        <Link to='/news/all' className={this.props.classes.link}>
          {this.props.global.resources.user_common_menu_news}
        </Link>
      </Button>
      <Hidden lgUp><br/></Hidden>

      <Button color="inherit" onClick={() => this.closeMenu()}>
        <Link to='/cart' className={this.props.classes.link}>
          {this.props.global.resources.user_common_cart}
        </Link>
      </Button>
      <Hidden lgUp><br/></Hidden>

      <Button color="inherit" onClick={() => this.closeMenu()}>
        <Link to='/offer' className={this.props.classes.link}>
          {this.props.global.resources.user_common_offer}
        </Link>
      </Button>
      <Hidden lgUp><br/></Hidden>

      <Button color="inherit" onClick={() => this.closeMenu()}>
        <Link to='/info' className={this.props.classes.link}>
          {this.props.global.resources.user_common_info}
        </Link>
      </Button>
      <Hidden lgUp><br/></Hidden>
    </React.Fragment>;
  }

  // Renderuje część menu głównego użytkownika, który jest zalogowany.
  renderUserPart() {
    const loggedIn = isLoggedIn();

    if (loggedIn) {
      return <React.Fragment>
        <Button color="inherit" onClick={() => this.closeMenu()}>
          <Link to='/account' className={this.props.classes.link}>
            {this.props.global.resources.user_common_myaccount}
          </Link>
        </Button>
        <Hidden lgUp><br/></Hidden>

        <Button color="inherit" onClick={() => this.handleLogOut()}>
          {this.props.global.resources.user_common_logout}
        </Button>
        <Hidden lgUp><br/></Hidden>
      </React.Fragment>;
    }

    return <React.Fragment>
      <Button color="inherit" onClick={() => this.closeMenu()}>
        <Link to='/login' className={this.props.classes.link}>
          {this.props.global.resources.user_common_login}
        </Link>
      </Button>
      <Hidden lgUp><br/></Hidden>
    </React.Fragment>;
  }

  // Renderuje szablon dla podstron części publicznej aplikacji.
  render() {
    return <React.Fragment>
      <AppBar position="fixed">
        <Toolbar>
          <Hidden lgUp>
            <IconButton color={'inherit'} onClick={() => this.openMenu()}>
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" color="inherit" >
              {this.props.global.resources.user_common_appname}
            </Typography>

            <div className={this.props.classes.right}>             
              <IconButton onClick={() => this.handleButtonLanguageClick()}>
                {this.renderLanguageIcon()}
              </IconButton>
            </div>           
          </Hidden>

          <Hidden mdDown>
            <Typography variant="h6" color="inherit" style={{ marginRight: '35px' }}>
              {this.props.global.resources.user_common_appname}
            </Typography>
            {this.renderCommonPart()}
            <div className={this.props.classes.right}>              
              {this.renderUserPart()}
              <IconButton onClick={() => this.handleButtonLanguageClick()}>
                {this.renderLanguageIcon()}
              </IconButton>
            </div>          
          </Hidden>

        </Toolbar>
      </AppBar>

      <Hidden lgUp>
        <Drawer open={this.state.menuOpened} onClose={() => this.closeMenu()}>
          <div className={this.props.classes.drawerContent}>
            {this.renderCommonPart()}
            {this.renderUserPart()}
          </div>
        </Drawer>
      </Hidden>

      <main>
        <Paper className={this.props.classes.main}>

          <Route exact path="/" render={props => <Books global={this.props.global} {...props} />}/>
          <Route exact path="/books" render={props => <Books global={this.props.global} {...props} />}/>
          <Route exact path="/book/details/:id" render={props => <BookDetails key={props.match.params.id} global={this.props.global} {...props} />}/>
          <Route exact path="/news/all" render={props => <News global={this.props.global} {...props} />}/>
          <Route exact path="/news/date/:date" render={props => <News key={props.match.params.date} global={this.props.global} {...props} />}/>
          <Route exact path="/news/details/:id" render={props => <NewsDetails key={props.match.params.id} global={this.props.global} {...props} />}/>
          <Route exact path="/login" render={props => <Login global={this.props.global} {...props} />}/>
          <Route exact path="/register" render={props => <Register global={this.props.global} {...props} />}/>
          <Route exact path="/info" render={props => <Info global={this.props.global} {...props} />}/>
          <Route exact path="/rules" render={props => <Rules global={this.props.global} {...props} />}/>
          <Route exact path="/cart" render={props => <Cart global={this.props.global} {...props} />}/>
          <Route exact path="/offer" render={props => <Offer global={this.props.global} {...props} />}/>
          <Route exact path="/account" render={props => <User global={this.props.global} {...props} />}/>
          <Route exact path="/account/order/details/:id" render={props => <OrderDetails key={props.match.params.id} global={this.props.global} {...props} />}/>
          <Route exact path="/account/offer/details/:id" render={props => <OfferDetails key={props.match.params.id} global={this.props.global} {...props} />}/>
          <Route exact path="/account/file/details/:id" render={props => <FileDetails key={props.match.params.id} global={this.props.global} {...props} />}/>
          <Route exact path="/confirm_account/:token" render={props => <ConfirmAccount key={props.match.params.token} global={this.props.global} {...props} />}/>
          <Route exact path="/confirm_payment/:id" render={props => <PaymentConfirmator key={props.match.params.id} global={this.props.global} {...props} />}/>
        </Paper>


      </main>



    </React.Fragment>;
  }
}

export default withStyles(styles)(Layout);
