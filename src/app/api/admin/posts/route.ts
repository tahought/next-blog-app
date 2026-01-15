// ... 省略
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        published: true, // 追加 
        createdAt: true,
        categories: {
// ... 省略