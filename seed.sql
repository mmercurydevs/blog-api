CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

create table articles (
	id SERIAL PRIMARY KEY,
	title varchar(255) not null,
	slug varchar(255) UNIQUE,
	body text not null,
	category_id integer references categories(id) ON DELETE SET NULL,
	status varchar(20) not null default 'draft' check (status in ('draft', 'published')),
	published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories
INSERT INTO categories (name) VALUES
    ('Technology'),
    ('Personal'),
    ('Tarot & Reflection');

-- Articles
INSERT INTO articles (title, slug, body, category_id, status, published_at)
VALUES
    (
        'Why I Started Building a Blog API',
        'why-i-started-building-a-blog-api',
        'I have been wanting a place to write that is entirely mine, not tied to a platform I do not control. This post walks through why I decided to build my own backend instead of using an existing blogging platform, and what I am hoping to learn along the way.',
        (SELECT id FROM categories WHERE name = 'Technology'),
        'published',
        CURRENT_TIMESTAMP
    ),
    (
        'A Quiet Sunday Reset',
        'a-quiet-sunday-reset',
        'Some weeks need a full stop before they can start again. Here is what my reset routine looks like lately, and why having a consistent shape to the day matters more to me than what is actually on the list.',
        (SELECT id FROM categories WHERE name = 'Personal'),
        'published',
        CURRENT_TIMESTAMP
    ),
    (
        'Notes from a Tarot Pull I Did Not Expect',
        'notes-from-a-tarot-pull-i-did-not-expect',
        'I was not planning to do a reading today, but the cards had other ideas. Some thoughts on what came up and how I am sitting with it.',
        (SELECT id FROM categories WHERE name = 'Tarot & Reflection'),
        'draft',
        NULL
    );