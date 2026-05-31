import FormContainer from "./FormContainer";

export default { component: FormContainer };

type Args = Parameters<typeof FormContainer>[0];

export const Default = {
  args: {
    children: "Form content",
  } as Args,
};

export const WithMultipleChildren = {
  args: {
    children: (
      <>
        <p>First element</p>
        <p>Second element</p>
        <p>Third element</p>
      </>
    ),
  } as Args,
};
