import React from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

const messagesEnglish = {
    "chooseExtensionModalTitle": "Optional Extensions for Your Project :)"
  }

const messagesJapanese = {
    "chooseExtensionModalTitle": "プロジェクトのオプション拡張機能 :)"
  }

const TranslationHOC = function(WrappedComponent) {
    class TranslationContainer extends React.PureComponent {
        constructor (props) {
            super(props);
        }
        state = {
            messages: {},
        };
        componentDidMount() {
            this.updateTranslation();
        }
        componentDidUpdate(){
            this.updateTranslation();
        }
        updateTranslation = () => {
            if (this.props.currentLocale === 'ja') {
                this.setState({
                    messages: messagesJapanese,
                  });
            } else {
                this.setState({
                    messages: messagesEnglish,
                  });
            }
          }
        render () {
            return (<WrappedComponent
                messagesTranslation={this.state.messages}
                {...this.props}
            />);
        }
    }
    TranslationContainer.propTypes = {
        currentLocale: PropTypes.string.isRequired,
    };
    const mapStateToProps = state => {
        return {
            currentLocale: state.locales.locale,
        }
    }
    return connect(
        mapStateToProps,
    )(TranslationContainer);

};

export default TranslationHOC;
