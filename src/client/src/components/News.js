import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, Typography, Grid, Divider, Button } from '@material-ui/core';
import Pagination from "material-ui-flat-pagination";
import NewsFilter from './NewsFilter';
import LoadingIndicator from './LoadingIndicator';
import { get } from '../api/base';

const styles = theme => ({
  newsCard: {
    padding: '20px',
    overflow: 'hidden',
  },
  cardImage: {
    paddingRight: '5px',
    float: 'left',
    maxWidth: '20vw',
    maxHeight: '200px'
  },
  newsSeperator: {
    margin: '20px',
  }
});

// Komponent reprezentujący podstronę do wyświetlania aktualności i informacji o antykwariacie
class News extends Component {
  constructor(props) {
    super(props);

    this.openNews = this.openNews.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.changePage = this.changePage.bind(this);
    this.renderNews = this.renderNews.bind(this);

    this.state = {
      newsLoading: true,
      newsCountLoading: true,
      news: [],
      totalNewsCount: 0,
      newsOffset: 0
    };
  }

  // Pobiera z serwera listę aktualności.
  componentDidMount() {
    this.props.global.changeResourcesPrefix('news', false);

    const dateOfNews = this.props.match.params.date;

    const newsApiPath = dateOfNews 
      ? `/api/news/${dateOfNews}/page/1` 
      : `/api/news/page/1`;

    get(newsApiPath).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ news: data, newsLoading: false });
          });

        case response.status === 404:
          this.setState({ news: [ ], newsLoading: false });
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    const newsCountApiPath = dateOfNews 
      ? `/api/news/${dateOfNews}/count` 
      : `/api/news/count`;

    get(newsCountApiPath).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.text().then(data => { 
            this.setState({ totalNewsCount: data, newsCountLoading: false });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });
  }

  // Otwiera szczegóły wybranej aktualności.
  openNews(id) {
    this.props.history.push(`/news/details/${id}`);
  }

  // Zmienia stronę z wyświetlanymi aktualnościami, jeśli jest ich więcej niż maksymalna ilość na stronę.
  changePage(offset) {
    this.setState({ newsOffset: offset });

    const newPage = (offset + 10) / 10;

    const dateOfNews = this.props.match.params.date;

    const newsApiPath = dateOfNews 
      ? `/api/news/${dateOfNews}/page/${newPage}` 
      : `/api/news/page/${newPage}`;

    get(newsApiPath).then(response => {
      switch (true) { 

        case response.status === 200:    
          return response.json().then(data => { 
            this.setState({ news: data });
          });

        case response.status === 404:
          this.setState({ news: [ ] });
          break;

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });
  }

  // Renderuje nagłówek listy aktualności.
  renderHeader() {
    const dateOfNews = this.props.match.params.date;

    if (!dateOfNews) {
      return <Typography variant={'h4'}>
        {this.props.global.resources.user_news_header}
      </Typography>;
    }

    return <React.Fragment>
      <Typography variant={'h4'}>
        { `${this.props.global.resources.user_news_header}: ${dateOfNews.replace('-', '.')}` }
      </Typography>
      <Typography variant={'caption'}>
        <Link to={`/news/all`}>
          {`(${this.props.global.resources.user_news_showAllNews})`}
        </Link>
      </Typography>
    </React.Fragment>;
  }

  // Renderuje listę aktualności.
  renderNews() {
    if (this.state.newsLoading || this.state.newsCountLoading) {
      return <LoadingIndicator />
    }

    return <React.Fragment>
      {this.state.news.map(news => <React.Fragment>

        <div className={this.props.classes.newsCard}>

          <Typography variant={'h6'}>
            {news.title} 
          </Typography><br/>

          <Typography>
            {news.date.substring(0,10)} 
          </Typography><br/>

          <Typography>
            {news.newsPhotos.find(x => x.isMainPhoto === true) ? <img src={news.newsPhotos.find(x => x.isMainPhoto === true).photo.url} className={this.props.classes.cardImage} /> : false}
            {news.description}
          </Typography><br style={{ clear: 'both' }}/>

          <Button onClick={() =>this.openNews(news.id)}>
            {this.props.global.resources.user_news_showNews}
          </Button><br/>

        </div>

        <Divider className={this.props.classes.newsSeperator} />

        </React.Fragment>)}

        <Pagination limit={10} offset={this.state.newsOffset} total={this.state.totalNewsCount}
        onClick={(e, offset) => this.changePage(offset)}/>

    </React.Fragment>;
  }

  // Renderuje listę aktualności oraz panel z informacjami o antykwariacie.
  render() {
    return <React.Fragment>

      <Grid container spacing={16}>

        <Grid item xs={12} md={8}>        
          {this.renderHeader()}       
          {this.renderNews()}
        </Grid>

        <Grid item md={4}>
          <NewsFilter filter={this.state.filter} global={this.props.global} {...this.props} />
        </Grid>

      </Grid>

    </React.Fragment>;
  }
}

export default withStyles(styles)(News);
