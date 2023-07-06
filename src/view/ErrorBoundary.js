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