import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  const path = (value: string) => `${basePath}${value}`

  return {
    name: 'BeU NextGen',
    short_name: 'NextGen',
    description: 'AI-powered financial companion for youth money habits.',
    start_url: path('/'),
    scope: path('/'),
    display: 'standalone',

    background_color: '#F8FAFC',
    theme_color: '#DF0059',
    icons: [
      {
        src: path('/assets/NEXTGEN.png'),
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: path('/assets/NEXTGEN.png'),
        sizes: '512x512',
        type: 'image/png',
      },
    ],

  }
}
