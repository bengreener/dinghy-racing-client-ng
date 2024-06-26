/*
 * Copyright 2022-2024 BG Information Systems Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error };
    }

    componentDidCatch(error, info) {
        // You can also log the error to an error reporting service.
        console.error(error, info);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custome fallback UI.
            return (
                <>
                    <h1>Error</h1>
                    <h2>{this.state.error.name}</h2>
                    <p>{this.state.error.message}</p>
                </>
            )
        }

        return this.props.children;
    }
}

export default ErrorBoundary;