import  React, {Component}  from 'react';
import "./Validateinput.css"

class Validateinput extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        myinput: ''
      }
    }
    
    handleChange(evt) {
      const myinput = (evt.target.validity.valid) ? evt.target.value : this.state.myinput;
      
      this.setState({ myinput });
    }
    
    render() {
      return (
        <div class="Wrapper">
        
        <div class="Input">
        <input type="text" class="Input-text" pattern="[0-9]*" onInput={this.handleChange.bind(this)} value={this.state.myinput} />
        </div>
        </div>
      )
    }
  }
    
//  ReactDOM.render(<Validateinput />, document.body);
export default Validateinput;