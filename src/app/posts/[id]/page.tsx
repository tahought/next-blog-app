// ... 省略
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        published: true, // 追加
        coverImageURL: true,
// ... 省略