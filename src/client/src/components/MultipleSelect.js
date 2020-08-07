import React, { Component } from 'react';
import { withStyles, Select, MenuItem, Chip } from '@material-ui/core';

const styles = theme => ({
  select: {
    minWidth: '300px'
  },
  chip: {
    margin: '3px'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '250px'
  },
});

// Komponent formułujący rozwijaną listę wielokrotnego wyboru. 
class MultipleSelect extends Component {
  constructor(props) {
    super(props);

    this.selectValue = this.selectValue.bind(this);
    this.findLabel = this.findLabel.bind(this);
  }

  // Aktualizuje stan komponentu wyświetlającego ten komponent w zakresie danych, za które odpowiada ta lista.
  selectValue(value) {
    this.props.setValues(this.props.dataType, value);
  }

  // Interpretuje wartości rozwijanej listy w formie liczbowych identyfikatorów na frazy zgodne z wersją językową strony.
  findLabel(id) {
    if (this.props.dataType === 'orders') {
      return id;
    }
    const item = this.props.items.find(x => x.id === id);
    if (this.props.dataType === 'authors') {
      return item.nickName ? item.nickName : `${item.lastName} ${item.firstName}`;
    }
    return this.props.global.currentLanguage === 'en' ? item.nameEn : item.namePl;
  }

  // Renderuje zawartość komponentu.
  render() {
    return  <Select multiple 
      disabled={this.props.disabled}
      className={this.props.classes.select}
      value={this.props.ids}
      onChange={event => this.selectValue(event.target.value)}
      renderValue={ids => 
        <div className={this.props.classes.chips}>
          {ids.map(id => <Chip key={id} label={this.findLabel(id)} className={this.props.classes.chip} />)} 
        </div>}>

        { this.props.items.map(item => 
          <MenuItem key={`${this.props.dataType}-${item.id}`} value={item.id}>
            {this.findLabel(item.id)}
          </MenuItem> )}
    </Select>;
  }
}

export default withStyles(styles)(MultipleSelect);
