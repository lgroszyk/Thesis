import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, Typography } from '@material-ui/core';
import { get } from '../api/base';

const styles = theme => ({
  filterWrapper: {
    whiteSpace: 'pre-wrap'
  }
});

// Komponent zawierający informacje o antykwariacie oraz listę do flitrowania wyświetlanych aktualności.
class NewsFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      months: [],
      aboutUs: '',
      address: '',
      timetable: ''
    }
  }
  
  // Pobiera z serwera informacje o antykwariacie oraz listę miesięcy do filtrowania wyświetlanych aktualności.
  componentDidMount() {
    get('/api/news/months').then(response => {
      switch (true) { 

        case response.status === 200:             
          return response.json().then(data => {
            this.setState({ months: data });
          });

        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });

    get('/api/config').then(response => {
      switch (response.status) {
        case 200:
          return response.json().then(data => {
            this.setState({ aboutUs: data.aboutUs, address: data.address, timetable: data.timetable });
          })
      
        default:
          this.props.global.openSnackbar(this.props.global.resources.user_common_errors_500);
          break;
      }
    });
  }

  // Renderuje zawartość komponentu.
  render() {
    return <div className={this.props.classes.filterWrapper}>

      <Typography>
        {`${this.props.global.resources.user_common_aboutus}:`}<br/><br/>
        {this.state.aboutUs}
      </Typography><br/>
      
      <Typography>
        {`${this.props.global.resources.user_common_address}:`}<br/><br/>
        {this.state.address}
      </Typography><br/>

      <Typography>
        {`${this.props.global.resources.user_common_timetable}:`}<br/><br/>
        {this.state.timetable}
      </Typography><br/>

      <Typography>
        {`${this.props.global.resources.user_common_archive}:`}
      </Typography>

      {this.state.months.map(month =>
        <p key={month}>
          <Typography >
            <Link to={`/news/date/${month}`}>
              {month.replace('-', '.')}
            </Link>
          </Typography>
        </p> ) }<br/>

    </div>;
  }
}

export default withStyles(styles)(NewsFilter);
