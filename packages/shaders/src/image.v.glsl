#version 300 es

in vec3 a_position;
in vec2 a_texCoord;

out vec2 o_TexCoord;

void main () {
  gl_Position = vec4(a_position.x, -a_position.y, a_position.z, 1.0);
  o_TexCoord = a_texCoord;
}
