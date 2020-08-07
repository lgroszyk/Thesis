import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { withStyles, Grid, Typography, Divider } from '@material-ui/core';

import NewsFilter from './NewsFilter';
import LoadingIndicator from './LoadingIndicator';

import { getById } from '../api/base';

const styles = theme => ({
  mainPhoto: {
    maxWidth: '100%',
    maxHeight: '250px'
  },
  newsSeparator: {
    display: 'none',
    [theme.breakpoints.down(960)]: {
      display: 'block'
    },
  }
});

class NewsDetails extends Component {
  constructor(props) {
    super(props);

    this.renderMainPhotoIfExists = this.renderMainPhotoIfExists.bind(this);
    this.renderAdditionalPhotosIfExist = this.renderAdditionalPhotosIfExist.bind(this);
    this.renderDate = this.renderDate.bind(this);
    this.renderLinkToPreviousNewsIfExists = this.renderLinkToPreviousNewsIfExists.bind(this);
    this.renderLinkToNextNewsIfExists = this.renderLinkToNextNewsIfExists.bind(this);
    this.renderNews = this.renderNews.bind(this);

    this.state = {
      newsLoading: true,
      nextNewsLoading: true,
      previousNewsLoading: true,
      news: { },
      previousNews: null,
      nextNews: null,
      months: []
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const id = nextProps.match.params.id;

    if(id !== prevState.news.id){
      getById('/api/news', id).then(response => {
        switch (true) { 
  
          case response.status === 200:             
            return response.json().then(data => {
              return ({ news: data, newsLoading: false });
            });
  
          case response.status === 404:
            this.props.history.push('/news/all');
            return { newsLoading: false };
  
          default:
            this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
            return { newsLoading: false };
        }
      });
   }
   else return null;
  }

  componentDidMount() {
    this.props.global.changeResourcesPrefix('newsdetails', false);

    const id = this.props.match.params.id;

    getById('/api/news', id).then(response => {
      switch (true) { 

        case response.status === 200:             
          return response.json().then(data => {
            this.setState({ news: data, newsLoading: false });
          });

        case response.status === 404:
          this.setState({ newsLoading: false });
          this.props.history.push('/news/all');
          break;

        default:
          this.setState({ newsLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    getById('/api/news/previous', id).then(response => {
      switch (true) { 

        case response.status === 200:             
          return response.json().then(data => {
            this.setState({ previousNews: data, previousNewsLoading: false });
          });

        case response.status === 404:
          this.setState({ previousNewsLoading: false });
          break;

        default:
          this.setState({ previousNewsLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    getById('/api/news/next', id).then(response => {
      switch (true) { 

        case response.status === 200:             
          return response.json().then(data => {
            this.setState({ nextNews: data, nextNewsLoading: false });
          });

        case response.status === 404:
          this.setState({ nextNewsLoading: false });
          break;

        default:
          this.setState({ nextNewsLoading: false });
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });
  }

  renderMainPhotoIfExists() {

    const mainPhoto = this.state.news.newsPhotos.find(x => x.isMainPhoto === true);
    if (mainPhoto) {
      return <img src={mainPhoto.photo.url} className={this.props.classes.mainPhoto} />;
    }
    return false;
  }

  renderAdditionalPhotosIfExist() {
    return false;
  }

  renderDate() {
    const date = this.state.news.date;
    if (date) {
      return date.substring(0,10);
    }
    return false;
  }

  renderLinkToPreviousNewsIfExists() {
    const news = this.state.previousNews;

    if (news) {
      return <Typography align={'left'}>
        <Link to={`/news/details/${news.id}`}>
          {`<- ${news.title}`}
        </Link>
      </Typography>;
    }

    return false;
  }

  renderLinkToNextNewsIfExists () {
    const news = this.state.nextNews;

    if (news) {
      return <Typography align={'right'}>
        <Link to={`/news/details/${news.id}`}>
          {`${news.title} ->`}
        </Link>
      </Typography>;
    }

    return false;
  }

  renderNews() {
    if (this.state.newsLoading || this.state.nextNewsLoading || this.state.previousNewsLoading) {
      return <LoadingIndicator />;
    }

    return <React.Fragment>
      <Typography variant={'h4'}>
        {this.state.news.title}
      </Typography><br/>

      <Typography>
        {`${this.props.global.resources.user_newsdetails_publishdate}: ${this.renderDate()}`}
      </Typography><br/><br/>

      {this.renderMainPhotoIfExists()}<br/><br/><br/>

      <Typography style={{ whiteSpace: 'pre-wrap' }}>
        {this.state.news.content}
      </Typography><br/>

      {this.renderAdditionalPhotosIfExist()}

      <br/><br/>

      <Grid container spacing={16}>

        <Grid item xs={4}>
          {this.renderLinkToPreviousNewsIfExists()}
        </Grid>

        <Grid item xs={4} />

        <Grid item xs={4}>
          {this.renderLinkToNextNewsIfExists()}
        </Grid>
      </Grid>
      
      <br/><br/><br/>
    </React.Fragment>;
  }
  
  render() {
    return <React.Fragment>

    <Grid container spacing={16}>

      <Grid item xs={12} md={8}>

        {this.renderNews()}

        <Typography>
          <Link to='/news/all'>
            {this.props.global.resources.user_newsdetails_gotonewslist}
          </Link>
        </Typography>

        <br/><br/><br/>

        <Divider className={this.props.classes.newsSeparator} />

        <br/>

      </Grid>

      <Grid item md={4}>
        <NewsFilter global={this.props.global} {...this.props} />
      </Grid>

    </Grid>

  </React.Fragment>;
  }
}

export default withStyles(styles)(NewsDetails);
