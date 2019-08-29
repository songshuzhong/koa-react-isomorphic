import React, {Component} from 'react';

import '../styles/home.less';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {...props.initialState};
        this.createItem = this.createItem.bind(this);
    }

    createItem({content, ...other}, i) {
        return (
            <div className='hk-video-wrapper' key={i}>
                <div className='title'>
                    {
                        content['title']
                    }
                </div>
                <img className='video' src={content['cover_src']} />
                <div className='duration'>
                    <span>{content['duration']}</span>
                    <div />
                    <span>{content['duration']}</span>
                </div>
                <div className='foot-bar' >
                    <div className='prior'>{content['publish_time']}</div>
                    <div>
                        <div className='praise'>
                            <span>&nbsp;{i}</span>
                        </div>
                        <div className='comment'>
                            <span>&nbsp;{content['commentNum']}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <React.Fragment>
                {
                    this.state.apiData.video.results.map((item, index) => this.createItem(item, index))
                }
            </React.Fragment>
        );
    }
}

export {Home};
export default Home;
