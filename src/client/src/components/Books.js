import React, { Component } from 'react';
import { withStyles, Grid, Select, Card, Typography, Chip, MenuItem, Button, Hidden, Drawer, TextField, FormControl, FormControlLabel, Checkbox, InputLabel } from '@material-ui/core';
import Pagination from "material-ui-flat-pagination";
import LoadingIndicator from './LoadingIndicator';
import { get, post } from '../api/base';
import validator from 'validator';

const styles = theme => ({
  select: {
    width: '220px'
  },
  input: {
    width: '220px'
  },
  chip: {
    margin: '3px'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '250px'
  },
  filtersStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      padding: '20px'
    },
    minHeight: '1000px',
    overflowY: 'auto'
  },

  bookCard: {
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '250px',
    height: '450px',
    [theme.breakpoints.down(420)]: {
      width: 'calc(100% - 20px)',
      height: 'auto'
    }
  },
  bookCardImg: {
    height: '250px',
    maxWidth: '100%',
    [theme.breakpoints.down(420)]: {
      width: '100%',
      height: '100%'
    },
  },
  booksContainer: {
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    [theme.breakpoints.down(420)]: {
      flexDirection: 'column',
      flexWrap: 'nowrap',

    },
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-start',

    },
  }
});

// Podstrona prezentująca ofertę książek antykwariatu oraz panel do filtrowania oferty.
class Books extends Component {
  constructor(props) {
    super(props);

    this.renderBooks = this.renderBooks.bind(this);
    this.renderFilter = this.renderFilter.bind(this);
    this.sendFilter = this.sendFilter.bind(this);
    this.openBook = this.openBook.bind(this);
    this.findLanguageLabel = this.findLanguageLabel.bind(this);
    this.findCategoryLabel = this.findCategoryLabel.bind(this);
    this.changeField = this.changeField.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.changePage = this.changePage.bind(this);
    this.validate = this.validate.bind(this);
    this.openDrawer = this.openDrawer.bind(this);

    this.state = {
      drawerOpened: false,
      booksLoading: true,
      books: [],
      languagesLoading: true,
      categoriesLoading: true,
      filter: { page: 1, booksPerPage: 9, languagesIds: [], categoriesIds: [] },
      allLanguages: [],
      allCategories: [],
      totalBooksCount: 0,
      booksOffset: 0
    }
  }

  // Pobiera z serwera książki z oferty oraz informacje do fitrowania: kategorie i języki książek.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('books', false);
    
    post('/api/books', { page: 1, booksPerPage: 9 }).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ books: data.books, totalBooksCount: data.totalBooksCountForThisFilter, booksLoading: false });
          });

        default:
          this.setState({ books: [], booksLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    get('/api/books/languages').then(response => {
      switch (response.status) {

        case 200:
          return response.json().then(data => this.setState({ allLanguages: data, languagesLoading: false }));
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500)
          break;
      }
    });

    get('/api/books/categories').then(response => {
      switch (response.status) {

        case 200:
          return response.json().then(data => this.setState({ allCategories: data, categoriesLoading: false }));
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500)
          break;
      }
    });
  }

  // Interpretuje wartości rozwijanej listy z językami książek na frazy zgodne z wersją językową strony.
  findLanguageLabel(languageId) {
    const language = this.state.allLanguages.find(l => l.id === languageId);
    return this.props.global.currentLanguage === 'en' ? language.nameEn : language.namePl;
  }

  // Interpretuje wartości rozwijanej listy z kategoriami książek na frazy zgodne z wersją językową strony.
  findCategoryLabel (categoryId) {
    const category = this.state.allCategories.find(c => c.id === categoryId);
    return this.props.global.currentLanguage === 'en' ? category.nameEn : category.namePl;
  }

  // Zmienia stronę z wyświetlanymi książkami, jeśli jest ich więcej niż maksymalna ilość na stronę.
  changePage(offset) {
    this.setState({ booksOffset: offset });

    const newPage = (offset + 9) / 9;

    let filter = this.state.filter;
    filter.page = newPage;
    this.setState({ filter: filter, booksLoading: true, drawerOpened: false });

    setTimeout(() => 

    post('/api/books', this.state.filter).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ books: data.books, totalBooksCount: data.totalBooksCountForThisFilter, booksLoading: false });
          });

        default:
          this.setState({ books: [], booksLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    }), 1000);
  }

  // Filtruje ofertę antykwariatu według wskazanych kryteriów.
  sendFilter() {
    
    this.validate();

    setTimeout(() => {
      if (this.state.validationError) {
        this.props.global.openSnackbar(this.props.global.resources.user_common_errors_validation)
        return;
      }

      const filter = {
        page: 1,
        booksPerPage: 9,
        maximumPrice: this.state.filter.maximumPrice,
        isElectronic: this.state.filter.isElectronic,
        titleOrAuthorFilter: this.state.filter.titleOrAuthorFilter,
        categoriesIds: this.state.filter.categoriesIds,
        languagesIds: this.state.filter.languagesIds,
        releaseMinimumDate: this.state.filter.releaseMinimumDate,
        releaseMaximumDate: this.state.filter.releaseMaximumDate,
        purchaseMinimumDate: this.state.filter.purchaseMinimumDate,
        purchaseMaximumDate: this.state.filter.purchaseMaximumDate,
      };
      
      this.setState({ booksLoading: true, drawerOpened: false, filter: filter });

      post('/api/books', filter).then(response => {
        switch (true) { 
  
          case response.status === 200:    
            return response.json().then(data => { 
              this.setState({ books: data.books, totalBooksCount: data.totalBooksCountForThisFilter, booksLoading: false });
            });
  
          default:
            this.setState({ books: [], booksLoading: false });
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
            break;
        }
      });
    }, 1000);
  }

  // Otwiera szczegóły wybranej książki.
  openBook(id) {
    this.props.history.push(`/book/details/${id}`);
  }

  // Sprawdza formę danych przesyłanych w celu filtrowania oferty.
  validate() {
    const filter = this.state.filter;
    this.setState({ validationError: false, maximumPriceError: false, isElectronicError: false, titleOrAuthorFilterError: false, releaseMinimumDateError: false, releaseMaximumDateError: false, purchaseMinimumDateError: false, purchaseMaximumDateError: false });
  
    if (filter.maximumPrice && !validator.isDecimal(filter.maximumPrice.toString(), {force_decimal: false, decimal_digits: '2,2', locale: 'en-US'})) {
      this.setState({ validationError: true, maximumPriceError: true });
    }
    if (filter.isElectronic !== undefined && !validator.isBoolean(filter.isElectronic.toString())) {
      this.setState({ validationError: true, isElectronicError: true });
    }
    if (filter.titleOrAuthorFilter && !validator.isLength(filter.titleOrAuthorFilter, { min: 1, max: 64 })) {
      this.setState({ validationError: true, titleOrAuthorFilterError: true });
    }
    if (filter.releaseMinimumDate && !validator.isISO8601(filter.releaseMinimumDate.toString())) {
      this.setState({ validationError: true, releaseMinimumDateError: true });
    }
    if (filter.releaseMaximumDate && !validator.isISO8601(filter.releaseMaximumDate.toString())) {
      this.setState({ validationError: true, releaseMaximumDateError: true });
    }
    if (filter.purchaseMinimumDate && !validator.isISO8601(filter.purchaseMinimumDate.toString())) {
      this.setState({ validationError: true, purchaseMinimumDateError: true });
    }
    if (filter.purchaseMaximumDate && !validator.isISO8601(filter.purchaseMaximumDate.toString())) {
      this.setState({ validationError: true, purchaseMaximumDateError: true });
    }
    filter.categoriesIds.forEach(x => {
      if (!validator.isInt(x.toString())) {
        this.setState({ validationError: true });
      }
    });
    filter.languagesIds.forEach(x => {
      if (!validator.isInt(x.toString())) {
        this.setState({ validationError: true });
      }
    });
  }

  // Aktualizuje stan komponentu w zakresie kryteriów filtrowania oferty.
  changeField (event) {
    let filter = this.state.filter;
    filter[event.target.name] = event.target.value;
    this.setState({ filter: filter });
  }

  // Renderuje panel do filtrowania oferty.
  renderFilter() {
    if (this.state.languagesLoading || this.state.categoriesLoading || this.state.languagesLoading) {
      return false;
    }

    return <React.Fragment>

      <FormControl>
        <InputLabel shrink>{this.props.global.resources.user_books_filter_languages}</InputLabel>
        <Select multiple className={this.props.classes.select} 
          name={'languagesIds'}
          value={this.state.filter.languagesIds}
          onChange={(event) => this.changeField(event)}
          renderValue={ids => 
            <div className={this.props.classes.chips}>
              {ids.map(id => <Chip key={id} label={this.findLanguageLabel(id)} className={this.props.classes.chip} />)} 
            </div>}>

            { this.state.allLanguages.map(language => 
              <MenuItem key={`language-${language.id}`} value={language.id}>
                {this.findLanguageLabel(language.id)}
              </MenuItem> )}
        </Select>
      </FormControl><br/><br/>

      <FormControl>
        <InputLabel shrink>{this.props.global.resources.user_books_filter_categories}</InputLabel>
        <Select multiple className={this.props.classes.select}
          name={'categoriesIds'}
          value={this.state.filter.categoriesIds}
          onChange={(event) => this.changeField(event)}
          renderValue={ids => 
            <div className={this.props.classes.chips}>
              {ids.map(id => <Chip key={id} label={this.findCategoryLabel(id)} className={this.props.classes.chip} />)} 
            </div>}>

            { this.state.allCategories.map(category => 
              <MenuItem key={`category-${category.id}`} value={category.id}>
                {this.findCategoryLabel(category.id)}
              </MenuItem> )}
        </Select>
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'titleOrAuthorFilter'} value={this.state.filter.titleOrAuthorFilter} type={'text'} label={this.props.global.resources.user_books_filter_search} className={this.props.classes.input} error={this.state.titleOrAuthorFilterError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        {this.state.titleOrAuthorFilterError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.user_books_filter_titleOrAuthorFilterError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'releaseMinimumDate'} value={this.state.filter.releaseMinimumDate} type={'date'} label={this.props.global.resources.user_books_filter_releaseMinDate} className={this.props.classes.input} error={this.state.releaseMinimumDateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        {this.state.releaseMinimumDateError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.user_books_filter_releaseMinimumDateError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'releaseMaximumDate'} value={this.state.filter.releaseMaximumDate} type={'date'} label={this.props.global.resources.user_books_filter_releaseMaxDate} className={this.props.classes.input} error={this.state.releaseMaximumDateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        {this.state.releaseMaximumDateError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.user_books_filter_releaseMaximumDateError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'purchaseMinimumDate'} value={this.state.filter.purchaseMinimumDate} type={'date'} label={this.props.global.resources.user_books_filter_purchaseMinDate} className={this.props.classes.input} error={this.state.purchaseMinimumDateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        {this.state.purchaseMinimumDateError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.user_books_filter_purchaseMinimumDateError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'purchaseMaximumDate'} value={this.state.filter.purchaseMaximumDate} type={'date'} label={this.props.global.resources.user_books_filter_purchaseMaxDate} className={this.props.classes.input} error={this.state.purchaseMaximumDateError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        {this.state.purchaseMaximumDateError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.user_books_filter_purchaseMaximumDateError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
        <TextField name={'maximumPrice'} value={this.state.filter.maximumPrice} type={'number'} label={this.props.global.resources.user_books_filter_maximumPrice} className={this.props.classes.input} error={this.state.maximumPriceError} onChange={e => this.changeField(e)} InputLabelProps={{ shrink: true }}/><br/>
        {this.state.maximumPriceError ? <Typography variant={'caption'} color={'error'}>{this.props.global.resources.user_books_filter_maximumPriceError}</Typography> : false}
      </FormControl><br/><br/>

      <FormControl>
      <InputLabel shrink>{this.props.global.resources.user_books_filter_isElectronic}</InputLabel>
        <Select name={'isElectronic'} value={this.state.filter.isElectronic} className={this.props.classes.select} onChange={(event) => this.changeField(event)}>
          <MenuItem value={undefined}>{this.props.global.resources.user_books_filter_isElectronicOptions_any}</MenuItem>
          <MenuItem value={true}>{this.props.global.resources.user_books_filter_isElectronicOptions_true}</MenuItem>
          <MenuItem value={false}>{this.props.global.resources.user_books_filter_isElectronicOptions_false}</MenuItem>
        </Select>
      </FormControl><br/><br/>

      <FormControl>
        <Button color={'inherit'} onClick={() => this.sendFilter()}>
          {this.props.global.resources.user_books_filter}
        </Button>
      </FormControl>

    </React.Fragment>
  }

  // Renderuje listę książek z oferty antykwariatu w formie miniaturek zawierających główne zdjęcie, tytuł i cenę książki.
  renderBooks() {
    if (this.state.booksLoading || this.state.languagesLoading || this.state.categoriesLoading) {
      return <LoadingIndicator/>;
    }

    const books = this.state.books.map(book => <div key={`book-${book.id}`}>
      <Card className={this.props.classes.bookCard}>
  
        <img src={book.booksPhotos.find(x => x.isMainPhoto === true).photo.url} className={this.props.classes.bookCardImg}/><br/>

        <Typography variant={'title'} align={'center'} style={{ padding: '10px' }}>
          {book.title}
        </Typography><br/>

        <Typography>
          {book.price.toFixed(2) + ' zł'}
        </Typography>

        <Button onClick={() =>this.openBook(book.id)}>
          {this.props.global.resources.user_books_showBook}
        </Button><br/>

      </Card>
    </div>);

    return <React.Fragment>
      {books}<br/><br/>
      <Grid item xs={12}>
        <Pagination limit={9} offset={this.state.booksOffset} total={this.state.totalBooksCount}
            onClick={(e, offset) => this.changePage(offset)}/>
      </Grid>
    </React.Fragment>;
  }

  // Otwiera panel z flitrami, jeśli strona jest przeglądana na smartfonie lub tablecie.
  openDrawer() {
    this.setState({ drawerOpened: true });
  }

  // Zamyka panel z filtrami.
  closeDrawer() {
    this.setState({ drawerOpened: false });
  }

  // Renderuje zawartość komponentu w formie oferty książek oraz panelu do filtrowania oferty.
  render() {
    return <React.Fragment>

      <Hidden mdUp>
        <Drawer open={this.state.drawerOpened}>
          <div className={this.props.classes.filtersStack}>      
            <Button onClick={() => this.closeDrawer()}>
              {this.props.global.resources.user_books_closeFilter}
            </Button><br/>
            {this.renderFilter()}
          </div>
        </Drawer>
      </Hidden>  

      <Grid container>  
        <Hidden smDown>
          <Grid item xs={12} md={3}>
            <div className={this.props.classes.filtersStack}>      
              {this.renderFilter()}
            </div>
          </Grid>
        </Hidden>       

        <Grid item xs={12} md={9}> 



          <Hidden mdUp>
            <Button onClick={() => this.openDrawer()}>
              {this.props.global.resources.user_books_openFilter}
            </Button><br/><br/>   
          </Hidden> 

          <div className={this.props.classes.booksContainer} >
            {this.renderBooks()}
          </div>
        </Grid>
      </Grid>
    </React.Fragment>;
  }
}

export default withStyles(styles)(Books);
