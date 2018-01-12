import React, { Component } from 'react'
import {
  Link
} from 'react-router-dom'
import styled from 'styled-components'

const PaintingWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`

export default class Painting extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const selectedImage = this.props.match.params.id ? this.props.getImageObj(this.props.match.params.id) : null

        return (
            <PaintingWrapper>
                {
                    selectedImage && (
                        <div>
                            <img id={selectedImage.id} className="image" src={selectedImage.url} alt={selectedImage.name} />
                        </div>
                    )
                }
            </PaintingWrapper>
        )
    }
}
