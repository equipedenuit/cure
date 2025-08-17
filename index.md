
---
layout: default
title: {{ site.title }}
---

{% for post in site.posts %}
  <article>
    <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
    <div class="meta">{{ post.date | date: "%-d %B %Y" }}</div>
    {{ post.content }}   <!-- contenu complet -->
  </article>
  {% unless forloop.last %}<hr>{% endunless %}
{% endfor %}

