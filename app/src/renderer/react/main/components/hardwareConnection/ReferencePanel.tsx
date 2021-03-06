import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import usePreload from '../../hooks/usePreload';
import { IStoreState } from '../../store';
import EmailIcon from '../../../../images/email.svg';
import HomepageIcon from '../../../../images/home.svg';
import MovieIcon from '../../../../images/movie.svg';

const ReferenceDiv = styled.div`
    display: grid;
    margin-bottom: 25px;
    text-align: right;
    font-weight: bold;
    line-height: 25px;
    font-size: 14px;
    color: #595757;
`;

const ReferenceContentSpan = styled.span`
    width: 100%;
    height: 100%;
    font-size: 12px;
    color: #555555;
    text-align: left;
    cursor: pointer;
    text-decoration: none;
`;

const ReferenceIconContainer = styled.div`
    display: inline-block;
    margin-right: 8px;
`;

const ReferenceIcon = styled.img`
    vertical-align: middle;
`

const RightBox = styled.div`
    float: right;
`;

const ReferencePanel: React.FC = () => {
    const { translator, clipboard, rendererRouter } = usePreload();
    const selectedHardware = useSelector<IStoreState, IHardwareConfig | undefined>(
        state => state.connection.selectedHardware,
    );
    const copyString = useCallback((str: string) => {
        clipboard.writeText(str);
        alert(translator.translate('Copied to clipboard'));
    }, []);

    if (!selectedHardware) {
        return <React.Fragment />;
    }

    const { email, url, video } = selectedHardware;

    return (
        <ReferenceDiv id="reference">
            {
                email &&
                <div id="emailArea">
                    <RightBox onClick={() => {
                        copyString(email);
                    }}>
                        <ReferenceIconContainer>
                            <ReferenceIcon src={EmailIcon} alt={'email'}/>
                        </ReferenceIconContainer>
                        <ReferenceContentSpan id="email">{email}</ReferenceContentSpan>
                    </RightBox>
                </div>
            }
            {
                url &&
                <div id="urlArea">
                    <RightBox onClick={() => rendererRouter.openExternalUrl(url)}>
                        <ReferenceIconContainer>
                            <ReferenceIcon src={HomepageIcon} alt={'homepage'} />
                        </ReferenceIconContainer>
                        <ReferenceContentSpan id="url">{url}</ReferenceContentSpan>
                    </RightBox>
                </div>
            }
            {
                video &&
                <div id="videoArea">
                    <ReferenceIconContainer>
                        <ReferenceIcon src={MovieIcon} alt={'movies'}/>
                    </ReferenceIconContainer>
                    {
                        video instanceof Array
                            ? video.map((videoElement) => (
                                <React.Fragment key={videoElement}>
                                    <ReferenceContentSpan
                                        id="video"
                                        onClick={() => rendererRouter.openExternalUrl(videoElement)}
                                    >{videoElement}</ReferenceContentSpan>
                                    <br/>
                                </React.Fragment>
                            ))
                            : <ReferenceContentSpan
                                id="video"
                                onClick={() => rendererRouter.openExternalUrl(video)}
                            >{video}</ReferenceContentSpan>
                    }
                </div>
            }
        </ReferenceDiv>
    );
};

export default ReferencePanel;
