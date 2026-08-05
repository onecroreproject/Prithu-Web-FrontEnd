import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({
    title = 'Prithu - Best Status & Motivational Video App',
    description = 'Explore Prithu - watch status videos, motivational, spiritual & educational reels, movie dialogues & daily life impressions with smart personalization and instant sharing.',
    keywords = 'Prithu, status videos, motivational videos, spiritual reels, educational reels, movie dialogues, daily life impressions, video status app',
    name = 'Prithu',
    type = 'website',
    author = 'Prithu Team',
    publisher = 'Prithu',
    canonical = 'https://prithu.app',
    image = 'https://prithu.app/prithulogo.png',
    schemaMarkup = null
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta name="publisher" content={publisher} />
            <meta name="robots" content="index, follow" />
            {canonical && <link rel="canonical" href={canonical} />}

            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content="Prithu" />
            <meta property="og:image" content={image} />
            {canonical && <meta property="og:url" content={canonical} />}

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {schemaMarkup && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaMarkup)}
                </script>
            )}
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    author: PropTypes.string,
    publisher: PropTypes.string,
    canonical: PropTypes.string,
    image: PropTypes.string,
    schemaMarkup: PropTypes.object,
};

export default SEO;
