import React, { Component, StrictMode } from "react";
import { render } from "react-dom";
// import {createRoot} from "react-dom/client";
import HomePage from './HomePage';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div>
                <HomePage />
            </div>
        )
    };
}

const appDiv = document.getElementById('app');
// const root = createRoot(appDiv);

render(<App/>, appDiv)
// root.render(
//     <StrictMode>
//         <App/>
//     </StrictMode>
// )

// render(appDiv, <App/>);