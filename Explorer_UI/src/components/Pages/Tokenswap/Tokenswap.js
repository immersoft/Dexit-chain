
//import ValidaINputFunctional from "./components/ValidaINputFunctional";
import Fields from './Fields';

import Buttonsclick from './Buttonsclick';
import Selects from './Selects';

function Tokenswap() {
    return ( 
        <div className="App" style={{display:"flex",justifyContent:"center",alignItems:"center", paddingTop: '100px'}}>
           SOURCE 
           <div style={{paddingLeft: '20px'}} >
          <Selects />
          </div>
          <div >
         <Fields />
         </div>
         <div style={{paddingLeft: '20px'}}>
          <Buttonsclick />
          </div >
          <div style={{paddingLeft: '20px'}}>
           DESTINATION
           </div>
           <div style={{paddingLeft: '20px'}}>
          <Selects />
          </div>
      <Fields />
        </div>
    );
}

export default Tokenswap;