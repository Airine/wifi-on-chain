module.exports = {
  title: 'WiFi on the chain',
  tagline: 'Bidding based wireless resource allocation system running using blockchain.', // one sentence description
  url: 'https://Airine.github.io',
  baseUrl: '/wifi-on-chain/',
  favicon: 'img/favicon.ico',
  organizationName: 'Airine', // Usually your GitHub org/user name.
  projectName: 'wifi-on-chain', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'WiFi on the chain',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/intro',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {href: 'https://Airine.github.io/blog', label: 'Blog', position: 'left'},
        {href: 'https://Airine.github.io/', label: 'Home', position: 'right'},
        {
          href: 'https://github.com/Airine/wifi-on-chain',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'About',
              href: 'https://blog.aaron-xin.tech/about/',
            },
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'Notion',
              href: 'https://www.notion.so/Notion-notes-41a54e26bd18461e87b6fabdfa26d43b',
            }
          ],
        },
        {
          title: 'Organizations',
          items: [
            {
              label: 'SUSTech',
              href: 'https://www.sustech.edu.cn'
            },
            {
              label: 'CAN Studio',
              href: 'https://SUSTech-CANStudio.github.io',
            },
            {
              label: 'CAN Tech Co.,Ltd.',
              href: 'https://SUSTech-CANStudio.github.io',
            }
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Instagram',
              href: 'https://www.instagram.com/airine0119/'
            },
            {
              label: 'Facebook',
              href: 'https://www.facebook.com/runxin.tian'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/airine',
            }
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'Samuel',
              href: "https://hustergs.github.io"
            },
            {
              label: 'Gallery (Tempt)',
              to: 'gallery'
            },
            {
              label: 'Tags',
              to:'blog/tags'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 一口闰心`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/Airine/wifi-on-chain/edit/master/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
