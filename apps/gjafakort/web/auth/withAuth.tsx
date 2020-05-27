import React, { Component } from 'react'
import Router from 'next/router'
import { NextComponentType } from 'next'

import { isAuthenticated } from './utils'

const AUTH_URL = '/api/auth/login'

export default (WrappedComponent: NextComponentType) =>
  class extends Component {
    static async getInitialProps(ctx) {
      if (!isAuthenticated(ctx)) {
        const authUrl = `${AUTH_URL}?returnUrl=${ctx.asPath}`
        const { res } = ctx
        if (res) {
          res.writeHead(302, {
            Location: authUrl,
          })
          res.end()
        } else {
          Router.push(authUrl)
          return {}
        }
      }

      const props = { isAuthenticated: true }
      if (WrappedComponent.getInitialProps) {
        return await WrappedComponent.getInitialProps(
          Object.assign({}, ctx, props),
        )
      }
      return { isAuthenticated: true }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
