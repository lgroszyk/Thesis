import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { withStyles, AppBar, Toolbar, Drawer, List, Tooltip, ListItem, ListItemIcon, Typography, Button } from '@material-ui/core';

import BookIcon from '@material-ui/icons/Book';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import PeopleIcon from '@material-ui/icons/People';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import CloudIcon from '@material-ui/icons/Cloud';
import PhotoIcon from '@material-ui/icons/Photo';
import PaletteIcon from '@material-ui/icons/Palette';

import AdminBooksList from './AdminBooksList';
import AdminBookDetails from './AdminBookDetails';
import AdminNewsList from './AdminNewsList';
import AdminNewsDetails from './AdminNewsDetails';
import AdminUsersList from './AdminUsersList';
import AdminUserDetails from './AdminUserDetails';
import AdminOrdersList from './AdminOrdersList';
import AdminOrderDetails from './AdminOrderDetails';
import AdminOffersList from './AdminOffersList';
import AdminOfferDetails from './AdminOfferDetails';
import AdminPhotosList from './AdminPhotosList';
import AdminFileDetails from './AdminFileDetails';
import AdminFilesList from './AdminFilesList';
import AdminBooksCategoriesList from './AdminBooksCategoriesList';
import AdminBookCategoryForm from './AdminBookCategoryForm';
import AdminBooksLanguagesList from './AdminBooksLanguagesList';
import AdminBookLanguageForm from './AdminBookLanguageForm';
import AdminBooksAuthorsList from './AdminBooksAuthorsList';
import AdminBookAuthorForm from './AdminBookAuthorForm';
import AdminConfigForm from './AdminConfigForm';

const drawerWidth = '60px';

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  list: {
    marginTop: '75px',
  },
  drawer: {
    width: drawerWidth
  },
  drawerPaper: {
    width: drawerWidth
  },
  lastOnLeft: {
    flexGrow: 1,
  },
  content: {
    margin: '70px 10px 0 70px'
  }
});

// Kontener na podstrony panelu administracyjnego
class AdminLayout extends Component {
  constructor(props){
    super(props);

    this.handleButtonLanguageClick = this.handleButtonLanguageClick.bind(this);
    this.redirect = this.redirect.bind(this);
  }

  // Zmienia wersję językową strony.
  handleButtonLanguageClick() {
    this.props.global.changeLanguage();
  }

  // Przekierowuje na podany adres.
  redirect(link) {
    this.props.history.push(link);
  }

  // Renderuje szablon dla podstron panelu administracyjnego.
  render() {
    return <React.Fragment>
      <AppBar position="fixed" className={this.props.classes.appBar}>
        <Toolbar>
          <Typography variant="h6" color="inherit" className={this.props.classes.lastOnLeft}>
            {this.props.global.resources.admin_common_appname}
          </Typography>
          <Button color="inherit" onClick={() => this.handleButtonLanguageClick()}>
            {this.props.global.currentLanguage}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" className={this.props.classes.drawer} classes={{ paper: this.props.classes.drawerPaper }}>
        <List className={this.props.classes.list}>
        
          <Tooltip title={this.props.global.resources.admin_common_menu_books}>
            <ListItem button onClick={() => this.redirect('/admin/books')}>               
              <ListItemIcon>
                <BookIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <Tooltip title={this.props.global.resources.admin_common_menu_news}>
            <ListItem button onClick={() => this.redirect('/admin/news')}>               
              <ListItemIcon>
                <AnnouncementIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <Tooltip title={this.props.global.resources.admin_common_menu_users}>
            <ListItem button onClick={() => this.redirect('/admin/users')}>               
              <ListItemIcon>
                <PeopleIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>


          <Tooltip title={this.props.global.resources.admin_common_menu_orders}>
            <ListItem button onClick={() => this.redirect('/admin/orders')}>               
              <ListItemIcon>
                <ShoppingCartIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <Tooltip title={this.props.global.resources.admin_common_menu_offers}>
            <ListItem button onClick={() => this.redirect('/admin/offers')}>               
              <ListItemIcon>
                <LocalOfferIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <Tooltip title={this.props.global.resources.admin_common_menu_photos}>
            <ListItem button onClick={() => this.redirect('/admin/photos')}>               
              <ListItemIcon>
                <PhotoIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <Tooltip title={this.props.global.resources.admin_common_menu_files}>
            <ListItem button onClick={() => this.redirect('/admin/files')}>               
              <ListItemIcon>
                <CloudIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>

          <Tooltip title={this.props.global.resources.admin_common_menu_config}>
            <ListItem button onClick={() => this.redirect('/admin/config')}>               
              <ListItemIcon>
                <PaletteIcon/>
              </ListItemIcon>
            </ListItem>
          </Tooltip>
        </List>
      </Drawer>

      <main className={this.props.classes.content}>
        <Route exact path={"/admin"} render={props => <AdminOrdersList global={this.props.global} {...props} />} />
        <Route exact path={"/admin/books"} render={props => <AdminBooksList global={this.props.global} {...props} />} />
        <Route path={"/admin/book/add"} render={props => <AdminBookDetails key={0} add global={this.props.global} {...props} />} />
        <Route path={"/admin/book/details/:id"} render={props => <AdminBookDetails key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/news"} render={props => <AdminNewsList global={this.props.global} {...props} />} />
        <Route path={"/admin/news/add"} render={props => <AdminNewsDetails key={0} add global={this.props.global} {...props} />} />
        <Route path={"/admin/news/details/:id"} render={props => <AdminNewsDetails key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/users"} render={props => <AdminUsersList global={this.props.global} {...props} />} />
        <Route path={"/admin/user/add"} render={props => <AdminUserDetails key={0} add global={this.props.global} {...props} />} />
        <Route path={"/admin/user/details/:id"} render={props => <AdminUserDetails key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/orders"} render={props => <AdminOrdersList global={this.props.global} {...props} />} />
        <Route path={"/admin/order/details/:id"} render={props => <AdminOrderDetails key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/offers"} render={props => <AdminOffersList global={this.props.global} {...props} />} />
        <Route path={"/admin/offer/details/:id"} render={props => <AdminOfferDetails key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route path={"/admin/photos"} render={props => <AdminPhotosList add global={this.props.global} {...props} />} />
        <Route path={"/admin/files"} render={props => <AdminFilesList add global={this.props.global} {...props} />} />
        <Route path={"/admin/file/add"} render={props => <AdminFileDetails add key={0} add global={this.props.global} {...props} />} />
        <Route path={"/admin/file/details/:id"} render={props => <AdminFileDetails edit delete key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/categories"} render={props => <AdminBooksCategoriesList global={this.props.global} {...props} />} />
        <Route path={"/admin/category/add"} render={props => <AdminBookCategoryForm add key={0} global={this.props.global} {...props} />} />
        <Route path={"/admin/category/details/:id"} render={props => <AdminBookCategoryForm edit delete key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/languages"} render={props => <AdminBooksLanguagesList global={this.props.global} {...props} />} />
        <Route path={"/admin/language/add"} render={props => <AdminBookLanguageForm add key={0} global={this.props.global} {...props} />} />
        <Route path={"/admin/language/details/:id"} render={props => <AdminBookLanguageForm edit delete key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route exact path={"/admin/authors"} render={props => <AdminBooksAuthorsList global={this.props.global} {...props} />} />
        <Route path={"/admin/author/add"} render={props => <AdminBookAuthorForm add key={0} global={this.props.global} {...props} />} />
        <Route path={"/admin/author/details/:id"} render={props => <AdminBookAuthorForm edit delete key={props.match.params.id} global={this.props.global} {...props} />} />
        <Route path={"/admin/config"} render={props => <AdminConfigForm global={this.props.global} {...props} />} />
      </main>

    </React.Fragment>;
  }
}

export default withStyles(styles)(AdminLayout);
